import { XCircle } from "lucide-react";
import StatusPage from "@/components/site/StatusPage";

export default function Page() {
  return (
    <StatusPage
      icon={XCircle}
      iconClassName="bg-danger/10 text-danger"
      title="El pago no se pudo completar"
      text="Algo falló al procesar tu pago y no te cobramos nada. Volvé a intentar la inscripción cuando quieras."
    />
  );
}
