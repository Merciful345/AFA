import { Clock } from "lucide-react";
import StatusPage from "@/components/site/StatusPage";

export default function Page() {
  return (
    <StatusPage
      icon={Clock}
      iconClassName="bg-warning/10 text-warning"
      title="Pago en proceso"
      text="Tu pago todavía se está procesando (algunos medios, como efectivo, tardan un poco más). Te confirmamos tu inscripción apenas se acredite."
    />
  );
}
