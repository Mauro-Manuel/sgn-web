
import { useState, type FormEvent } from "react";
import { ShieldCheck } from "lucide-react";

import { bodyAuthorizationService } from "../../services/bodyAuthorizationService";

import type { CompetentBody } from "../../types/competentBody/CompetentBody";

export interface AuthorizationUserOption {
  id: string;
  fullName: string;
  username: string;
}

interface Props {
  users: AuthorizationUserOption[];
  competentBodies: CompetentBody[];
 onCreated: (userId: string) => void;
}

function getToday(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Luanda",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (type: string) =>
    parts.find(part => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}`;
}

export default function CreateBodyAuthorizationForm({
  users,
  competentBodies,
  onCreated,
}: Props) {
  const [userId, setUserId] = useState("");
  const [competentBodyId, setCompetentBodyId] = useState("");
  const [validFrom, setValidFrom] = useState(getToday);
  const [validUntil, setValidUntil] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting) return;

    if (!userId || !competentBodyId || !validFrom) {
      setError("Preenche todos os campos obrigatórios.");
      return;
    }

    if (validUntil && validUntil < validFrom) {
      setError(
        "A data de fim não pode ser anterior à data de início."
      );
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await bodyAuthorizationService.createBodyAuthorization({
        userId,
        competentBodyId,
        validFrom,
        validUntil: validUntil || null,
      });

      setUserId("");
      setCompetentBodyId("");
      setValidFrom(getToday());
      setValidUntil("");

      onCreated(userId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao criar autorização."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="body-authorization-card">
      <div className="body-authorization-heading">
        <ShieldCheck size={23} />

        <div>
          <h3>Criar Autorização</h3>
          <p>
            Autoriza um utilizador a actuar num Órgão
            Competente durante um período definido.
          </p>
        </div>
      </div>

      <form
        className="body-authorization-form"
        onSubmit={handleSubmit}
      >
        <div className="field-group">
          <label htmlFor="authorization-user">
            Utilizador *
          </label>

          <select
            id="authorization-user"
            value={userId}
            onChange={event => setUserId(event.target.value)}
            required
            disabled={isSubmitting || users.length === 0}
          >
            <option value="">
              Seleccionar utilizador
            </option>

            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.fullName} ({user.username})
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="authorization-body">
            Órgão Competente *
          </label>

          <select
            id="authorization-body"
            value={competentBodyId}
            onChange={event =>
              setCompetentBodyId(event.target.value)
            }
            required
            disabled={
              isSubmitting || competentBodies.length === 0
            }
          >
            <option value="">
              Seleccionar Órgão Competente
            </option>

            {competentBodies.map(body => (
              <option key={body.id} value={body.id}>
                {body.name} ({body.code})
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="authorization-valid-from">
            Válido desde *
          </label>

          <input
            id="authorization-valid-from"
            type="date"
            value={validFrom}
            onChange={event => setValidFrom(event.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="field-group">
          <label htmlFor="authorization-valid-until">
            Válido até
          </label>

          <input
            id="authorization-valid-until"
            type="date"
            value={validUntil}
            min={validFrom}
            onChange={event => setValidUntil(event.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <p className="change-password-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="submit-button"
          disabled={
            isSubmitting ||
            !userId ||
            !competentBodyId ||
            !validFrom
          }
        >
          <ShieldCheck size={18} />
          {isSubmitting
            ? "A criar autorização..."
            : "Criar Autorização"}
        </button>
      </form>
    </section>
  );
}
