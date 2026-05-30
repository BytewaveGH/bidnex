type PermissionCategory = "crud" | "admin" | "page" | "ats" | "bds" | "a2f" | "notifications"

interface PermissionEntry {
  name: string
  key: string
  category: PermissionCategory
}

export const permissionRegistry: PermissionEntry[] = [
  // crud
  { name: "Create", key: "create", category: "crud" },
  { name: "Read", key: "read", category: "crud" },
  { name: "Update", key: "update", category: "crud" },
  { name: "Delete", key: "delete", category: "crud" },

  // admin
  { name: "Admin Dashboard View", key: "admin_dashboard_view", category: "admin" },
  { name: "Admin Users Manage", key: "admin_users_manage", category: "admin" },
  { name: "Admin Settings Manage", key: "admin_settings_manage", category: "admin" },
  { name: "Admin Reports View", key: "admin_reports_view", category: "admin" },

  // page
  { name: "Programs Page", key: "programs_page", category: "page" },
  { name: "Applications Page", key: "applications_page", category: "page" },
  { name: "Mentors Page", key: "mentors_page", category: "page" },
  { name: "Participants Page", key: "participants_page", category: "page" },

  // ats
  { name: "ATS Application View", key: "ats_application_view", category: "ats" },
  { name: "ATS Application Manage", key: "ats_application_manage", category: "ats" },
  { name: "ATS Stage Manage", key: "ats_stage_manage", category: "ats" },
  { name: "ATS Reviewer Assign", key: "ats_reviewer_assign", category: "ats" },

  // bds
  { name: "BDS ESO Assigned View", key: "bds_eso_assigned_view", category: "bds" },
  { name: "BDS ESO Assigned Manage", key: "bds_eso_assigned_manage", category: "bds" },
  { name: "BDS Mentors View", key: "bds_mentors_view", category: "bds" },
  { name: "BDS Services Manage", key: "bds_services_manage", category: "bds" },

  // a2f
  { name: "A2F Application View", key: "a2f_application_view", category: "a2f" },
  { name: "A2F Application Manage", key: "a2f_application_manage", category: "a2f" },
  { name: "A2F Report View", key: "a2f_report_view", category: "a2f" },

  // notifications
  { name: "Notifications View", key: "notifications_view", category: "notifications" },
  { name: "Notifications Manage", key: "notifications_manage", category: "notifications" },
  { name: "Notifications Send", key: "notifications_send", category: "notifications" },
]

export function nameToKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
}

export function getPermissionsByCategory(category: PermissionCategory): PermissionEntry[] {
  return permissionRegistry.filter((p) => p.category === category)
}

export function getPermissionKey(name: string): string {
  const found = permissionRegistry.find(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  )
  return found?.key ?? nameToKey(name)
}
