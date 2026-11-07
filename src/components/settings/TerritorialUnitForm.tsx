import { useEffect, useState, type FormEvent } from "react";
import { Plus, Save } from "lucide-react";

import { territorialUnitService } from "../../services/territorialUnitService";

import type {
  TerritorialLevel,
  TerritorialUnit,
} from "../../types/territorial/TerritorialUnit";

type CreatableLevel = Extract<
  TerritorialLevel,
  "NATIONAL" | "PROVINCIAL" | "MUNICIPAL" | "COMMUNAL"
>;

interface TerritorialUnitFormProps {
  nationalUnits: TerritorialUnit[];
  provinces: TerritorialUnit[];
  onCreated: () => void;
}

export default function TerritorialUnitForm({
  nationalUnits,
  provinces,
  onCreated,
}: TerritorialUnitFormProps) {
  const [level, setLevel] = useState<CreatableLevel>("NATIONAL");

  const [nationalId, setNationalId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedProvinceId, setSelectedProvinceId] = useState("");

  const [communeProvinceId, setCommuneProvinceId] = useState("");
  const [communeMunicipalityId, setCommuneMunicipalityId] = useState("");

  const [communeMunicipalities, setCommuneMunicipalities] = useState<
    TerritorialUnit[]
  >([]);

  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);

  const [municipalitiesError, setMunicipalitiesError] = useState("");

  useEffect(() => {
    if (level !== "COMMUNAL" || !communeProvinceId) {
      return;
    }

    let cancelled = false;

    async function loadMunicipalities() {
      setLoadingMunicipalities(true);
      setMunicipalitiesError("");

      try {
        const result =
          await territorialUnitService.getMunicipalities(communeProvinceId);

        if (!cancelled) {
          setCommuneMunicipalities(result);
        }
      } catch (err) {
        if (!cancelled) {
          setCommuneMunicipalities([]);
          setMunicipalitiesError(
            err instanceof Error ? err.message : "Erro ao carregar municípios.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingMunicipalities(false);
        }
      }
    }

    void loadMunicipalities();

    return () => {
      cancelled = true;
    };
  }, [level, communeProvinceId]);

  function getParentId(): string | null {
    switch (level) {
      case "NATIONAL":
        return null;

      case "PROVINCIAL":
        return nationalId || null;

      case "MUNICIPAL":
        return selectedProvinceId || null;

      case "COMMUNAL":
        return communeMunicipalityId || null;
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const parentId = getParentId();

    if (level !== "NATIONAL" && !parentId) {
      const messages = {
        PROVINCIAL: "Selecciona uma unidade nacional.",
        MUNICIPAL: "Selecciona primeiro uma província.",
        COMMUNAL: "Selecciona primeiro um município.",
      };

      setError(messages[level]);
      return;
    }

    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = name.trim();

    if (!trimmedCode || !trimmedName) {
      setError("Preenche o código e o nome.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await territorialUnitService.createTerritorialUnit({
        code: trimmedCode,
        name: trimmedName,
        level,
        parentId,
      });

      setCode("");
      setName("");

      onCreated();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro inesperado ao criar unidade territorial.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const parentDescription =
    level === "NATIONAL"
      ? "A unidade nacional não necessita de superior."
      : level === "PROVINCIAL"
        ? (nationalUnits.find((unit) => unit.id === nationalId)?.name ??
          "Selecciona uma unidade nacional.")
        : level === "MUNICIPAL"
          ? selectedProvinceId
            ? `Província superior: ${
                provinces.find((province) => province.id === selectedProvinceId)
                  ?.name ?? selectedProvinceId
              }`
            : "Selecciona uma província acima."
          : communeMunicipalityId
            ? `Município superior: ${
                communeMunicipalities.find(
                  (municipality) => municipality.id === communeMunicipalityId,
                )?.name ?? communeMunicipalityId
              }`
            : "Selecciona a província e o município acima.";

  return (
    <section className="territorial-create-panel">
      <div className="territorial-create-heading">
        <Plus size={21} />

        <div>
          <h3>Nova unidade territorial</h3>
          <p>Registar uma unidade nacional, província, município ou comuna.</p>
        </div>
      </div>

      <form className="territorial-create-form" onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="territorial-new-level">Nível territorial</label>

          <select
            id="territorial-new-level"
            value={level}
            onChange={(event) => {
              setLevel(event.target.value as CreatableLevel);
              setError("");
            }}
            disabled={isSubmitting}
          >
            <option value="NATIONAL">Nacional</option>
            <option value="PROVINCIAL">Província</option>
            <option value="MUNICIPAL">Município</option>
            <option value="COMMUNAL">Comuna</option>
          </select>
        </div>

        {level === "PROVINCIAL" && (
          <div className="field-group">
            <label htmlFor="territorial-national-parent">
              Unidade nacional superior
            </label>

            <select
              id="territorial-national-parent"
              value={nationalId}
              onChange={(event) => {
                setNationalId(event.target.value);
                setError("");
              }}
              required
              disabled={isSubmitting}
            >
              <option value="">Seleccionar unidade nacional</option>

              {nationalUnits
                .filter((unit) => unit.active)
                .map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        {level === "MUNICIPAL" && (
          <div className="field-group">
            <label htmlFor="territorial-province-parent">
              Província superior
            </label>

            <select
              id="territorial-province-parent"
              value={selectedProvinceId}
              onChange={(event) => {
                setSelectedProvinceId(event.target.value);
                setError("");
              }}
              required
              disabled={isSubmitting}
            >
              <option value="">Seleccionar província</option>

              {provinces
                .filter((province) => province.active)
                .map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        {level === "COMMUNAL" && (
          <>
            <div className="field-group">
              <label htmlFor="commune-province">Província</label>

              <select
                id="commune-province"
                value={communeProvinceId}
                onChange={(event) => {
                  setCommuneProvinceId(event.target.value);
                  setCommuneMunicipalityId("");
                  setCommuneMunicipalities([]);
                  setMunicipalitiesError("");
                  setError("");
                }}
                disabled={isSubmitting}
                required
              >
                <option value="">Seleccionar província</option>

                {provinces
                  .filter((province) => province.active)
                  .map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="commune-municipality">Município superior</label>

              <select
                id="commune-municipality"
                value={communeMunicipalityId}
                onChange={(event) => {
                  setCommuneMunicipalityId(event.target.value);
                  setError("");
                }}
                disabled={
                  isSubmitting ||
                  !communeProvinceId ||
                  loadingMunicipalities ||
                  Boolean(municipalitiesError)
                }
                required
              >
                <option value="">
                  {loadingMunicipalities
                    ? "A carregar municípios..."
                    : "Seleccionar município"}
                </option>

                {communeMunicipalities
                  .filter((municipality) => municipality.active)
                  .map((municipality) => (
                    <option key={municipality.id} value={municipality.id}>
                      {municipality.name}
                    </option>
                  ))}
              </select>
            </div>

            {municipalitiesError && (
              <p className="change-password-error" role="alert">
                {municipalitiesError}
              </p>
            )}
          </>
        )}

        <div className="field-group">
          <label htmlFor="territorial-new-code">Código</label>

          <input
            id="territorial-new-code"
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            maxLength={30}
            placeholder="Código único"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="field-group">
          <label htmlFor="territorial-new-name">Nome</label>

          <input
            id="territorial-new-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={150}
            placeholder="Nome da unidade territorial"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="territorial-parent-info">
          <strong>Unidade superior</strong>
          <p>{parentDescription}</p>
        </div>

        {error && (
          <p className="change-password-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="submit-button" disabled={isSubmitting}>
          <Save size={17} />
          {isSubmitting ? "A guardar..." : "Criar unidade territorial"}
        </button>
      </form>
    </section>
  );
}
