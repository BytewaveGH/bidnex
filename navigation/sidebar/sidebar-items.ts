import {
  Banknote,
  Calendar,
  ChartBar,
  Fingerprint,
  Forklift,
  Gauge,
  GraduationCap,
  Kanban,
  LayoutDashboard,
  ListTodo,
  Lock,
  type LucideIcon,
  Mail,
  MessageSquare,
  ReceiptText,
  ShoppingBag,
  SquareArrowUpRight,
  Users,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "BidChale",
    items: [
      {
        title: "Home",
        url: "/vendor/dashboard/home",
        icon: LayoutDashboard,
      },
      {
        title: "Lots/Products",
        url: "/vendor/dashboard/lots",
        icon: ShoppingBag,
      },
      // {
      //   title: "Default",
      //   url: "/vendor/dashboard/default",
      //   icon: LayoutDashboard,
      // },
      // {
      //   title: "CRM",
      //   url: "/vendor/dashboard/crm",
      //   icon: ChartBar,
      // },
      {
        title: "Finance",
        url: "/vendor/dashboard/finance",
        icon: Banknote,
      },
      // {
      //   title: "Analytics",
      //   url: "/vendor/dashboard/analytics",
      //   icon: Gauge,
      // },
      {
        title: "Disputes",
        url: "/vendor/dashboard/disputes",
        icon: ListTodo,
      },
      // {
      //   title: "Productivity",
      //   url: "/vendor/dashboard/productivity",
      //   icon: ListTodo,
      // },
      // {
      //   title: "E-commerce",
      //   url: "/vendor/dashboard/ecommerce",
      //   icon: ShoppingBag,
      // },
      // {
      //   title: "Academy",
      //   url: "/vendor/dashboard/academy",
      //   icon: GraduationCap,
      //   isNew: true,
      // },
      // {
      //   title: "Logistics",
      //   url: "/vendor/dashboard/logistics",
      //   icon: Forklift,
      // },
    ],
  },
  // {
  //   id: 2,
  //   label: "Pages",
  //   items: [
  //     {
  //       title: "Email",
  //       url: "/vendor/dashboard/mail",
  //       icon: Mail,
  //     },
  //     {
  //       title: "Chat",
  //       url: "/vendor/dashboard/coming-soon",
  //       icon: MessageSquare,
  //       comingSoon: true,
  //     },
  //     {
  //       title: "Calendar",
  //       url: "/vendor/dashboard/coming-soon",
  //       icon: Calendar,
  //       comingSoon: true,
  //     },
  //     {
  //       title: "Kanban",
  //       url: "/vendor/dashboard/coming-soon",
  //       icon: Kanban,
  //       comingSoon: true,
  //     },
  //     {
  //       title: "Invoice",
  //       url: "/vendor/dashboard/coming-soon",
  //       icon: ReceiptText,
  //       comingSoon: true,
  //     },
  //     {
  //       title: "Users",
  //       url: "/vendor/dashboard/users",
  //       icon: Users,
  //     },
  //     {
  //       title: "Roles",
  //       url: "/vendor/dashboard/roles",
  //       icon: Lock,
  //     },
  //     {
  //       title: "Authentication",
  //       url: "/vendor/auth",
  //       icon: Fingerprint,
  //       subItems: [
  //         { title: "Login v1", url: "/vendor/auth/v1/login", newTab: true },
  //         { title: "Login v2", url: "/vendor/auth/v2/login", newTab: true },
  //         { title: "Register v1", url: "/vendor/auth/v1/register", newTab: true },
  //         { title: "Register v2", url: "/vendor/auth/v2/register", newTab: true },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: 3,
  //   label: "Legacy",
  //   items: [
  //     {
  //       title: "Dashboards",
  //       url: "/vendor/dashboard/default-v1",
  //       subItems: [
  //         { title: "Default V1", url: "/vendor/dashboard/default-v1" },
  //         { title: "CRM V1", url: "/vendor/dashboard/crm-v1" },
  //         { title: "Finance V1", url: "/vendor/dashboard/finance-v1" },
  //         { title: "Analytics V1", url: "/vendor/dashboard/analytics-v1" },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: 4,
  //   label: "Misc",
  //   items: [
  //     {
  //       title: "Others",
  //       url: "/vendor/dashboard/coming-soon",
  //       icon: SquareArrowUpRight,
  //       comingSoon: true,
  //     },
  //   ],
  // },
];
