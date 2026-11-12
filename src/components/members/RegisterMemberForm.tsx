
import { useState, type FormEvent } from "react";
import { UserPlus } from "lucide-react";

import { memberService } from "../../services/memberService";

import type { RegisterMemberResponse } from "../../types/member/RegisterMemberResponse";

interface RegisterMemberFormProps {
  onRegistered: (result: RegisterMemberResponse) => void;
}

export default function RegisterMemberForm({
  onRegistered,
}: RegisterMemberFormProps) {
  const [fullName, setFullName] = useState("");
  const [identityCardNumber, setIdentityCardNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting) return;

    const normalizedFullName = fullName.trim();
    const normalizedIdentityCardNumber =
      identityCardNumber.trim();

    if (!normalizedFullName || !normalizedIdentityCardNumber) {
      setError("O nome completo e o BI são obrigatórios.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await memberService.registerMember({
        fullName: normalizedFullName,
        identityCardNumber: normalizedIdentityCardNumber,
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
      });

      setFullName("");
      setIdentityCardNumber("");
      setPhoneNumber("");
      setEmail("");

      onRegistered(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível registar o militante."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="member-form-card">
      <div className="territorial-create-heading">
        <UserPlus size={22} />

        <div>
          <h3>Registar Militante</h3>
          <p>
            Submeter um pedido de admissão
            para o Núcleo sob a tua responsabilidade.
          </p>
        </div>
      </div>

      <form
        className="territorial-create-form"
        onSubmit={handleSubmit}
      >
        <div className="field-group">
          <label htmlFor="member-full-name">
            Nome completo *
          </label>

          <input
            id="member-full-name"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={event =>
              setFullName(event.target.value)
            }
            placeholder="Nome completo"
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="member-identity-card">
            Bilhete de Identidade *
          </label>

          <input
            id="member-identity-card"
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={identityCardNumber}
            onChange={event =>
              setIdentityCardNumber(event.target.value)
            }
            placeholder="Número do BI"
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="member-phone">
            Telefone
          </label>

          <input
            id="member-phone"
            type="tel"
            autoComplete="tel"
            value={phoneNumber}
            onChange={event =>
              setPhoneNumber(event.target.value)
            }
            placeholder="Número de contacto"
            disabled={isSubmitting}
          />
        </div>

        <div className="field-group">
          <label htmlFor="member-email">
            Email
          </label>

          <input
            id="member-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={event =>
              setEmail(event.target.value)
            }
            placeholder="Endereço de email"
            disabled={isSubmitting}
          />
        </div>

        <div className="member-admission-info">
          O registo será submetido como pedido de
          admissão pendente de decisão.
        </div>

        {error && (
          <p className="change-password-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting}
        >
          <UserPlus size={17} />

          {isSubmitting
            ? "A registar..."
            : "Registar militante"}
        </button>
      </form>
    </section>
  );
}
