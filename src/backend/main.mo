import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Float "mo:core/Float";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public type LeadStage = {
    #new;
    #contacted;
    #qualified;
    #application;
    #approval;
    #funded;
  };

  public type CallOutcome = {
    #interested;
    #notInterested;
    #callBack;
    #noAnswer;
  };

  public type Lead = {
    id : Nat;
    name : Text;
    phone : Text;
    email : Text;
    loanAmount : Float;
    stage : LeadStage;
    createdAt : Time.Time;
    assignedTo : Principal;
    notes : List.List<Text>;
  };

  public type CallLog = {
    leadId : Nat;
    duration : Nat;
    outcome : CallOutcome;
    notes : Text;
    calledAt : Time.Time;
    user : Principal;
  };

  public type Task = {
    id : Nat;
    title : Text;
    dueTime : Time.Time;
    completed : Bool;
    assignedTo : Principal;
  };

  public type StatDashboard = {
    totalLeads : Nat;
    totalLeadsAssignedToCaller : Nat;
    callsToday : Nat;
    appsSubmitted : Nat;
    totalFunded : Float;
    avgLoanAmount : Float;
  };

  public type ViewLead = {
    id : Nat;
    name : Text;
    phone : Text;
    email : Text;
    loanAmount : Float;
    stage : LeadStage;
    createdAt : Time.Time;
    assignedTo : Principal;
    notes : [Text];
  };

  module Lead {
    public func compareByCreatedAt(a : Lead, b : Lead) : Order.Order {
      Int.compare(a.createdAt, b.createdAt);
    };
    public func compareByLoanAmount(a : Lead, b : Lead) : Order.Order {
      Float.compare(a.loanAmount, b.loanAmount);
    };
  };

  var nextLeadId = 1;
  var nextTaskId = 1;

  let leads = Map.empty<Nat, Lead>();
  let tasks = Map.empty<Nat, Task>();
  let callLogs = List.empty<CallLog>();

  public shared ({ caller }) func createLead(name : Text, phone : Text, email : Text, loanAmount : Float) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create leads");
    };

    let lead : Lead = {
      id = nextLeadId;
      name;
      phone;
      email;
      loanAmount;
      stage = #new;
      createdAt = Time.now();
      assignedTo = caller;
      notes = List.empty<Text>();
    };

    leads.add(nextLeadId, lead);
    nextLeadId += 1;
    lead.id;
  };

  public shared ({ caller }) func updateLead(id : Nat, name : Text, phone : Text, email : Text, loanAmount : Float, stage : LeadStage) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update leads");
    };

    switch (leads.get(id)) {
      case (null) { Runtime.trap("Lead not found") };
      case (?lead) {
        if (lead.assignedTo != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You do not own this lead");
        };

        let updatedLead : Lead = {
          lead with
          name;
          phone;
          email;
          loanAmount;
          stage;
        };
        leads.add(id, updatedLead);
      };
    };
  };

  public shared ({ caller }) func addNoteToLead(leadId : Nat, note : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add notes");
    };

    switch (leads.get(leadId)) {
      case (null) { Runtime.trap("Lead not found") };
      case (?lead) {
        if (lead.assignedTo != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You do not own this lead");
        };

        lead.notes.add(note);
      };
    };
  };

  public shared ({ caller }) func logCall(leadId : Nat, duration : Nat, outcome : CallOutcome, notes : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log calls");
    };

    let callLog : CallLog = {
      leadId;
      duration;
      outcome;
      notes;
      calledAt = Time.now();
      user = caller;
    };

    callLogs.add(callLog);
  };

  public shared ({ caller }) func createTask(title : Text, dueTime : Time.Time, assignedTo : Principal) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };

    let task : Task = {
      id = nextTaskId;
      title;
      dueTime;
      completed = false;
      assignedTo;
    };

    tasks.add(nextTaskId, task);
    nextTaskId += 1;
    task.id;
  };

  public shared ({ caller }) func completeTask(taskId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete tasks");
    };

    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        if (task.completed) { Runtime.trap("Task already completed") };
        if (task.assignedTo != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You do not own this task");
        };
        tasks.add(taskId, { task with completed = true });
      };
    };
  };

  public query ({ caller }) func getLead(leadId : Nat) : async ViewLead {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view leads");
    };

    switch (leads.get(leadId)) {
      case (null) { Runtime.trap("Lead not found") };
      case (?lead) {
        if (lead.assignedTo != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You do not own this lead");
        };
        {
          lead with
          notes = lead.notes.toArray();
        };
      };
    };
  };

  public query ({ caller }) func getCallerLeads() : async [ViewLead] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view leads");
    };

    leads.values().toArray().filter(func(lead) { lead.assignedTo == caller }).map(func(lead) { { lead with notes = lead.notes.toArray() } });
  };

  public query ({ caller }) func getLeadsByStage(stage : LeadStage) : async [ViewLead] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view leads");
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    leads.values().toArray().filter(func(lead) { lead.stage == stage and (isAdmin or lead.assignedTo == caller) }).map(func(lead) { { lead with notes = lead.notes.toArray() } });
  };

  public query ({ caller }) func getLeadsCreatedToday() : async [ViewLead] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view leads");
    };

    let now = Time.now();
    let twentyFourHours : Int = 24 * 60 * 60 * 1000000000;
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    leads.values().toArray().filter(func(lead) { now - lead.createdAt < twentyFourHours and (isAdmin or lead.assignedTo == caller) }).map(func(lead) { { lead with notes = lead.notes.toArray() } });
  };

  public query ({ caller }) func getLeadCountForCaller() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view lead counts");
    };

    var count = 0;
    leads.values().toArray().forEach(func(lead) { if (lead.assignedTo == caller) { count += 1 } });
    count;
  };

  public query ({ caller }) func getAllLeads() : async [ViewLead] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all leads");
    };

    leads.values().toArray().map(func(lead) { { lead with notes = lead.notes.toArray() } });
  };

  public query ({ caller }) func getLeadCountByStage(stage : LeadStage) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view lead counts");
    };

    var count = 0;
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    leads.values().toArray().forEach(func(lead) { if (lead.stage == stage and (isAdmin or lead.assignedTo == caller)) { count += 1 } });
    count;
  };

  public query ({ caller }) func getAllTasksForCaller() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    tasks.values().toArray().filter(func(task) { task.assignedTo == caller });
  };

  public query ({ caller }) func getCallsForLead(leadId : Nat) : async [CallLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view call logs");
    };

    switch (leads.get(leadId)) {
      case (null) { Runtime.trap("Lead not found") };
      case (?lead) {
        if (lead.assignedTo != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You do not own this lead");
        };

        let filtered = List.empty<CallLog>();
        callLogs.values().toArray().forEach(
          func(call) {
            if (call.leadId == leadId) {
              filtered.add(call);
            };
          }
        );
        filtered.toArray();
      };
    };
  };

  public query ({ caller }) func getAllCallLogsForCaller() : async [CallLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view call logs");
    };

    let filtered = List.empty<CallLog>();
    callLogs.values().toArray().forEach(
      func(call) {
        if (call.user == caller) {
          filtered.add(call);
        };
      }
    );
    filtered.toArray();
  };

  public query ({ caller }) func getLeadsByLoanAmount() : async [ViewLead] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all leads sorted by loan amount");
    };

    leads.values().toArray().map(func(lead) { { lead with notes = lead.notes.toArray() } }).sort(
      func(a, b) { Float.compare(b.loanAmount, a.loanAmount) }
    );
  };

  public query ({ caller }) func getLeadsOrderedByCreatedAt() : async [ViewLead] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all leads sorted by creation date");
    };

    leads.values().toArray().map(func(lead) { { lead with notes = lead.notes.toArray() } }).sort(
      func(a, b) { Int.compare(b.createdAt, a.createdAt) }
    );
  };

  public query ({ caller }) func getAllTasks() : async [Task] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all tasks");
    };

    tasks.values().toArray();
  };

  public query ({ caller }) func getStatsDashboard() : async StatDashboard {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dashboard stats");
    };

    let now = Time.now();
    let twentyFourHours : Int = 24 * 60 * 1000000000;
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    var callsToday = 0;
    var appsSubmitted = 0;
    var totalFunded : Float = 0;

    callLogs.values().toArray().forEach(
      func(call) {
        if (now - call.calledAt < twentyFourHours and (isAdmin or call.user == caller)) {
          callsToday += 1;
        };
      }
    );

    leads.values().toArray().forEach(
      func(lead) {
        if (isAdmin or lead.assignedTo == caller) {
          if (lead.stage == #application) {
            appsSubmitted += 1;
          };

          if (lead.stage == #funded) {
            totalFunded += lead.loanAmount;
          };
        };
      }
    );

    let allLeads = if (isAdmin) {
      leads.values().toArray();
    } else {
      leads.values().toArray().filter(func(lead) { lead.assignedTo == caller });
    };

    let callerLeadsCount = leads.values().toArray().filter(func(lead) { lead.assignedTo == caller }).size();

    let sum = allLeads.foldLeft(
      0.0,
      func(acc, lead) { acc + lead.loanAmount },
    );

    let avgLoan = if (allLeads.size() == 0) { 0.0 } else { sum / allLeads.size().toFloat() };

    {
      totalLeads = allLeads.size();
      totalLeadsAssignedToCaller = callerLeadsCount;
      callsToday;
      appsSubmitted;
      totalFunded;
      avgLoanAmount = avgLoan;
    };
  };

  public shared ({ caller }) func reassignLead(leadId : Nat, newOwner : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can reassign leads");
    };

    switch (leads.get(leadId)) {
      case (null) { Runtime.trap("Lead not found") };
      case (?lead) {
        let updatedLead : Lead = {
          lead with assignedTo = newOwner
        };
        leads.add(leadId, updatedLead);
      };
    };
  };

  public shared ({ caller }) func deleteLead(leadId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete leads");
    };

    if (not leads.containsKey(leadId)) {
      Runtime.trap("Lead not found");
    };
    leads.remove(leadId);
  };

  public shared ({ caller }) func deleteTask(taskId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete tasks");
    };
    if (not tasks.containsKey(taskId)) {
      Runtime.trap("Task not found");
    };
    tasks.remove(taskId);
  };

  public query ({ caller }) func getOverdueTasksForCaller() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    let now = Time.now();
    tasks.values().toArray().filter(func(task) { task.assignedTo == caller and not task.completed and task.dueTime < now });
  };
};
