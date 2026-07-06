import type { WorkflowConfig } from "./types"

// ---------------------------------------------------------------------------
// Built-in workflow templates
// Each template's config is stored in WorkflowDefinition.config
// ---------------------------------------------------------------------------

export const ORG_REGISTRATION_TEMPLATE: WorkflowConfig = {
  initialStep: "employee_review",
  steps: [
    {
      key: "employee_review",
      nameAr: "مراجعة الموظف",
      nameEn: "Employee Review",
      type: "approval",
      assigneeType: "role",
      assigneeRef: "COMMUNITY_EMPLOYEE",
      sla: { durationHours: 48, warningHours: 12, escalateTo: "COMMUNITY_MANAGER" },
      allowedActions: ["APPROVE", "REJECT", "RETURN"],
      transitions: {
        APPROVE: "manager_approval",
        REJECT: "rejected",
        RETURN: "employee_review",
      },
    },
    {
      key: "manager_approval",
      nameAr: "موافقة المدير",
      nameEn: "Manager Approval",
      type: "approval",
      assigneeType: "role",
      assigneeRef: "COMMUNITY_MANAGER",
      sla: { durationHours: 24, warningHours: 6, escalateTo: "SYSTEM_ADMIN" },
      allowedActions: ["APPROVE", "REJECT", "RETURN"],
      transitions: {
        APPROVE: "approved",
        REJECT: "rejected",
        RETURN: "employee_review",
      },
    },
    {
      key: "approved",
      nameAr: "مُعتمد",
      nameEn: "Approved",
      type: "auto",
      isTerminal: true,
      terminalStatus: "COMPLETED",
      transitions: {},
    },
    {
      key: "rejected",
      nameAr: "مرفوض",
      nameEn: "Rejected",
      type: "auto",
      isTerminal: true,
      terminalStatus: "REJECTED",
      transitions: {},
    },
  ],
}

export const INITIATIVE_APPROVAL_TEMPLATE: WorkflowConfig = {
  initialStep: "dept_head_review",
  steps: [
    {
      key: "dept_head_review",
      nameAr: "مراجعة رئيس القسم",
      nameEn: "Department Head Review",
      type: "approval",
      assigneeType: "role",
      assigneeRef: "DEPARTMENT_HEAD",
      sla: { durationHours: 72, warningHours: 24, escalateTo: "COLLEGE_DEAN" },
      allowedActions: ["APPROVE", "REJECT", "RETURN"],
      transitions: {
        APPROVE: "dean_approval",
        REJECT: "rejected",
        RETURN: "dept_head_review",
      },
    },
    {
      key: "dean_approval",
      nameAr: "موافقة العميد",
      nameEn: "Dean Approval",
      type: "approval",
      assigneeType: "role",
      assigneeRef: "COLLEGE_DEAN",
      sla: { durationHours: 48, warningHours: 12, escalateTo: "COMMUNITY_MANAGER" },
      allowedActions: ["APPROVE", "REJECT", "RETURN"],
      transitions: {
        APPROVE: "manager_final",
        REJECT: "rejected",
        RETURN: "dept_head_review",
      },
    },
    {
      key: "manager_final",
      nameAr: "الاعتماد النهائي من المدير",
      nameEn: "Final Manager Approval",
      type: "approval",
      assigneeType: "role",
      assigneeRef: "COMMUNITY_MANAGER",
      sla: { durationHours: 24, warningHours: 6, escalateTo: "SYSTEM_ADMIN" },
      allowedActions: ["APPROVE", "REJECT", "RETURN"],
      transitions: {
        APPROVE: "approved",
        REJECT: "rejected",
        RETURN: "dean_approval",
      },
    },
    {
      key: "approved",
      nameAr: "مُعتمدة",
      nameEn: "Approved",
      type: "auto",
      isTerminal: true,
      terminalStatus: "COMPLETED",
      transitions: {},
    },
    {
      key: "rejected",
      nameAr: "مرفوضة",
      nameEn: "Rejected",
      type: "auto",
      isTerminal: true,
      terminalStatus: "REJECTED",
      transitions: {},
    },
  ],
}

export const PARTNERSHIP_APPROVAL_TEMPLATE: WorkflowConfig = {
  initialStep: "employee_review",
  steps: [
    {
      key: "employee_review",
      nameAr: "مراجعة الموظف",
      nameEn: "Employee Review",
      type: "approval",
      assigneeType: "role",
      assigneeRef: "COMMUNITY_EMPLOYEE",
      sla: { durationHours: 48, warningHours: 12, escalateTo: "COMMUNITY_MANAGER" },
      allowedActions: ["APPROVE", "REJECT", "RETURN"],
      transitions: {
        APPROVE: "manager_approval",
        REJECT: "rejected",
        RETURN: "employee_review",
      },
    },
    {
      key: "manager_approval",
      nameAr: "اعتماد المدير",
      nameEn: "Manager Approval",
      type: "approval",
      assigneeType: "role",
      assigneeRef: "COMMUNITY_MANAGER",
      sla: { durationHours: 48, warningHours: 12, escalateTo: "SYSTEM_ADMIN" },
      allowedActions: ["APPROVE", "REJECT", "RETURN"],
      transitions: {
        APPROVE: "approved",
        REJECT: "rejected",
        RETURN: "employee_review",
      },
    },
    {
      key: "approved",
      nameAr: "مُعتمدة",
      nameEn: "Approved",
      type: "auto",
      isTerminal: true,
      terminalStatus: "COMPLETED",
      transitions: {},
    },
    {
      key: "rejected",
      nameAr: "مرفوضة",
      nameEn: "Rejected",
      type: "auto",
      isTerminal: true,
      terminalStatus: "REJECTED",
      transitions: {},
    },
  ],
}

export const WORKFLOW_TEMPLATES = {
  org_registration: ORG_REGISTRATION_TEMPLATE,
  initiative_approval: INITIATIVE_APPROVAL_TEMPLATE,
  partnership_approval: PARTNERSHIP_APPROVAL_TEMPLATE,
} as const

export type WorkflowTemplateKey = keyof typeof WORKFLOW_TEMPLATES
