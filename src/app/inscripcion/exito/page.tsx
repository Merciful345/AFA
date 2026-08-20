import { CheckCircle2 } from "lucide-react";
import StatusPage from "@/components/site/StatusPage";

export default function Page() {
  return (
    <StatusPage
      icon={CheckCircle2}
      iconClassName="bg-success/10 text-success"
      title="¡Pago recibido!"
      text="Ya quedaste anotado en el bracket de AFA. Te vamos a avisar la fecha y el lugar por Instagram (@afa.tucuman) apenas estén confirmados."
    />
  );
}
