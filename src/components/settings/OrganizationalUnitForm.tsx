
import { useEffect, useState, type FormEvent } from "react";
import { Save } from "lucide-react";

import { organizationalUnitService } from "../../services/organizationalUnitService";
import { territorialUnitService } from "../../services/territorialUnitService";

import type { TerritorialUnit } from "../../types/territorial/TerritorialUnit";

type TerritoryChoice =
  | "NATIONAL"
  | "PROVINCIAL"
  | "MUNICIPAL"
  | "COMMUNAL";

interface OrganizationalUnitFormProps {
  onCreated: () => void;
}

export default function OrganizationalUnitForm({
  onCreated,
}: OrganizationalUnitFormProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [parentId, setParentId] = useState("");

  const [territoryLevel, setTerritoryLevel] =
    useState<TerritoryChoice>("PROVINCIAL");

  const [nationals, setNationals] = useState<TerritorialUnit[]>([]);
  const [provinces, setProvinces] = useState<TerritorialUnit[]>([]);
  const [municipalities, setMunicipalities] =
    useState<TerritorialUnit[]>([]);
  const [communes, setCommunes] = useState<TerritorialUnit[]>([]);

  const [nationalId, setNationalId] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [municipalityId, setMunicipalityId] = useState("");
  const [communeId, setCommuneId] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTerritories() {
      setIsLoading(true);
      setError("");

      try {
        const [nationalData, provinceData] = await Promise.all([
          territorialUnitService.getNationalUnits(),
          territorialUnitService.getProvinces(),
        ]);

        if (!cancelled) {
          setNationals(nationalData);
          setProvinces(provinceData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Erro ao carregar unidades territoriais."
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadTerritories();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!provinceId) return;

    let cancelled = false;

    async function loadMunicipalities() {
      try {
        const result =
          await territorialUnitService.getMunicipalities(provinceId);

        if (!cancelled) setMunicipalities(result);
      } catch (err) {
        if (!cancelled) {
          setMunicipalities([]);
          setError(
            err instanceof Error ? err.message : "Erro ao carregar municípios."
          );
        }
      }
    }

    void loadMunicipalities();

    return () => {
      cancelled = true;
    };
  }, [provinceId]);

  useEffect(() => {
    if (!municipalityId) return;

    let cancelled = false;

    async function loadCommunes() {
      try {
        const result =
          await territorialUnitService.getCommunes(municipalityId);

        if (!cancelled) setCommunes(result);
      } catch (err) {
        if (!cancelled) {
          setCommunes([]);
          setError(
            err instanceof Error ? err.message : "Erro ao carregar comunas."
          );
        }
      }
    }

    void loadCommunes();

    return () => {
      cancelled = true;
    };
  }, [municipalityId]);

  function getTerritorialUnitId(): string {
    switch (territoryLevel) {
      case "NATIONAL":
        return nationalId;
      case "PROVINCIAL":
        return provinceId;
      case "MUNICIPAL":
        return municipalityId;
      case "COMMUNAL":
        return communeId;
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    const territorialUnitId = getTerritorialUnitId();

    if (!territorialUnitId) {
      setError("Selecciona uma unidade territorial.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await organizationalUnitService.createOrganizationalUnit({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        type: type.trim(),
        territorialUnitId,
        parentId: parentId.trim() || null,
      });

      setCode("");
      setName("");
      setType("");
      setParentId("");

      onCreated();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao criar unidade organizacional."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="territorial-create-panel">
      <div className="territorial-create-heading">
        <Save size={21} />

        <div>
          <h3>Nova unidade organizacional</h3>
          <p>Registar uma unidade na estrutura do SGN.</p>
        </div>
      </div>

      <form className="territorial-create-form" onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="org-code">Código</label>
          <input
            id="org-code"
            value={code}
            maxLength={30}
            required
            disabled={isSubmitting}
            onChange={event => setCode(event.target.value)}
            placeholder="Código único"
          />
        </div>

        <div className="field-group">
          <label htmlFor="org-name">Nome</label>
          <input
            id="org-name"
            value={name}
            maxLength={150}
            required
            disabled={isSubmitting}
            onChange={event => setName(event.target.value)}
            placeholder="Nome da unidade organizacional"
          />
        </div>

        <div className="field-group">
          <label htmlFor="org-type">Tipo de unidade</label>
          <input
            id="org-type"
            value={type}
            maxLength={50}
            required
            disabled={isSubmitting}
            onChange={event => setType(event.target.value)}
            placeholder="Tipo definido no backend"
          />
        </div>

        <div className="field-group">
          <label htmlFor="org-territory-level">
            Nível territorial de associação
          </label>

          <select
            id="org-territory-level"
            value={territoryLevel}
            disabled={isLoading || isSubmitting}
            onChange={event => {
              setTerritoryLevel(event.target.value as TerritoryChoice);
              setError("");
            }}
          >
            <option value="NATIONAL">Nacional</option>
            <option value="PROVINCIAL">Provincial</option>
            <option value="MUNICIPAL">Municipal</option>
            <option value="COMMUNAL">Comunal</option>
          </select>
        </div>

        {territoryLevel === "NATIONAL" && (
          <div className="field-group">
            <label htmlFor="org-national">Unidade nacional</label>
            <select
              id="org-national"
              value={nationalId}
              required
              disabled={isLoading || isSubmitting}
              onChange={event => setNationalId(event.target.value)}
            >
              <option value="">Seleccionar unidade nacional</option>
              {nationals.filter(unit => unit.active).map(unit => (
                <option key={unit.id} value={unit.id}>{unit.name}</option>
              ))}
            </select>
          </div>
        )}

        {territoryLevel !== "NATIONAL" && (
          <div className="field-group">
            <label htmlFor="org-province">Província</label>
            <select
              id="org-province"
              value={provinceId}
              required
              disabled={isLoading || isSubmitting}
              onChange={event => {
                setProvinceId(event.target.value);
                setMunicipalityId("");
                setCommuneId("");
                setMunicipalities([]);
                setCommunes([]);
                setError("");
              }}
            >
              <option value="">Seleccionar província</option>
              {provinces.filter(unit => unit.active).map(unit => (
                <option key={unit.id} value={unit.id}>{unit.name}</option>
              ))}
            </select>
          </div>
        )}

        {(territoryLevel === "MUNICIPAL" ||
          territoryLevel === "COMMUNAL") && (
          <div className="field-group">
            <label htmlFor="org-municipality">Município</label>
            <select
              id="org-municipality"
              value={municipalityId}
              required
              disabled={!provinceId || isSubmitting}
              onChange={event => {
                setMunicipalityId(event.target.value);
                setCommuneId("");
                setCommunes([]);
                setError("");
              }}
            >
              <option value="">Seleccionar município</option>
              {municipalities.filter(unit => unit.active).map(unit => (
                <option key={unit.id} value={unit.id}>{unit.name}</option>
              ))}
            </select>
          </div>
        )}

        {territoryLevel === "COMMUNAL" && (
          <div className="field-group">
            <label htmlFor="org-commune">Comuna</label>
            <select
              id="org-commune"
              value={communeId}
              required
              disabled={!municipalityId || isSubmitting}
              onChange={event => setCommuneId(event.target.value)}
            >
              <option value="">Seleccionar comuna</option>
              {communes.filter(unit => unit.active).map(unit => (
                <option key={unit.id} value={unit.id}>{unit.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="field-group">
          <label htmlFor="org-parent">Unidade organizacional superior</label>
          <input
            id="org-parent"
            value={parentId}
            onChange={event => setParentId(event.target.value)}
            disabled={isSubmitting}
            placeholder="UUID (opcional)"
            pattern="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
            title="Introduz um UUID válido ou deixa em branco."
          />
          <p className="user-form-help">
            Deixa em branco para uma unidade sem superior.
          </p>
        </div>

        {error && (
          <p className="change-password-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting || isLoading}
        >
          <Save size={17} />
          {isSubmitting
            ? "A guardar..."
            : "Criar unidade organizacional"}
        </button>
      </form>
    </section>
  );
}
