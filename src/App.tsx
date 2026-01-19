import React from "react";
import AppLayout from "./components/layout/AppLayout";
import ChildSupportPage from "./pages/ChildSupportPage";

function getRoute(): string {
  const hash = window.location.hash || "#/child-support";
  return hash.replace("#", "");
}

export default function App() {
  const [route, setRoute] = React.useState<string>(getRoute());

  React.useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const middle = route === "/child-support" ? <ChildSupportPage /> : <ChildSupportPage />;
  return <AppLayout middle={middle} />;
}
