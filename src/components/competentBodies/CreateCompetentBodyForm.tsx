
import { useState, type FormEvent } from "react";
import { Building2, Plus } from "lucide-react";

import { competentBodyService } from "../../services/competentBodyService";

interface OrganizationalUnitOption {
  id: string;
  name: string;
}

interface Props {
  organizationalUnits: OrganizationalUnitOption[];
  onCreated: () => void;
}

export default function CreateCompetentBodyForm({
  organizationalUnits,
  onCreated,
}: Props) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [organizationalUnitId, setOrganizationalUnitId] =
    useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting) return;

    if (
      !code.trim() ||
      !name.trim() ||
      !organizationalUnitId
    ) {
      setError("Preenche todos os campos obrigatórios.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await competentBodyService.createCompetentBody({
        code: code.trim(),
        name: name.trim(),
        organizationalUnitId,
      });

      setCode("");
      setName("");
      setOrganizationalUnitId("");

      onCreated();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível criar o órgão competente."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="competent-body-card">
      <div className="competent-body-heading">
        <Building2 size={22} />

        <div>
          <h3>Criar Órgão Competente</h3>
          <p>
            Regista um órgão e associa-o à sua
            Unidade Organizacional.
          </p>
        </div>
      </div>

     <form
  className="competent-body-form"
  onSubmit={handleSubmit}
>
  <div className="competent-body-fields">
    <div className="field-group">
      <label htmlFor="body-code">Código *</label>
      <input
        id="body-code"
        value={code}
        onChange={event => setCode(event.target.value)}
        placeholder="Ex.: OB-001"
        required
        disabled={isSubmitting}
      />
    </div>

    <div className="field-group">
      <label htmlFor="body-name">Nome *</label>
      <input
        id="body-name"
        value={name}
        onChange={event => setName(event.target.value)}
        placeholder="Ex.: Órgão de Base 001"
        required
        disabled={isSubmitting}
      />
    </div>
  </div>

  <div className="field-group">
    <label htmlFor="body-organizational-unit">
      Unidade Organizacional *
    </label>

    <select
      id="body-organizational-unit"
      value={organizationalUnitId}
      onChange={event =>
        setOrganizationalUnitId(event.target.value)
      }
      required
      disabled={
        isSubmitting || organizationalUnits.length === 0
      }
    >
      <option value="">
        {organizationalUnits.length === 0
          ? "Nenhuma unidade disponível"
          : "Seleccionar Unidade Organizacional"}
      </option>

      {organizationalUnits.map(unit => (
        <option key={unit.id} value={unit.id}>
          {unit.name}
        </option>
      ))}
    </select>
  </div>

  {error && (
    <p className="change-password-error" role="alert">
      {error}
    </p>
  )}

  <div className="competent-body-form-actions">
    <button
      type="submit"
      className="submit-button"
      disabled={
        isSubmitting ||
        !code.trim() ||
        !name.trim() ||
        !organizationalUnitId
      }
    >
      <Plus size={17} />
      {isSubmitting
        ? "A criar órgão..."
        : "Criar Órgão Competente"}
    </button>
  </div>
</form>
    </section>
  );
}
