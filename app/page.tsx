

// import DashboardPage from "./dashboard/page";

// export default function Home() {
//   return <DashboardPage />;
// }
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
}