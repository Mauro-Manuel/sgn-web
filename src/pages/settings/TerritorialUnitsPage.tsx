import { useEffect, useState } from "react";
import { MapPinned, RefreshCw } from "lucide-react";

import { territorialUnitService } from "../../services/territorialUnitService";
import type { TerritorialUnit } from "../../types/territorial/TerritorialUnit";
import TerritorialUnitForm from "../../components/settings/TerritorialUnitForm";

export default function TerritorialUnitsPage() {
  const [provinces, setProvinces] = useState<TerritorialUnit[]>([]);
  const [municipalities, setMunicipalities] = useState<TerritorialUnit[]>([]);
  const [communes, setCommunes] = useState<TerritorialUnit[]>([]);
  const [nationalUnits, setNationalUnits] = useState<TerritorialUnit[]>([]);

  const [provinceId, setProvinceId] = useState("");
  const [municipalityId, setMunicipalityId] = useState("");

  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadNationalUnits() {
      try {
        const units = await territorialUnitService.getNationalUnits();

        if (!cancelled) {
          setNationalUnits(units);
        }
      } catch (error) {
        if (!cancelled) {
          setNationalUnits([]);

          setError(
            error instanceof Error
              ? error.message
              : "Erro ao carregar unidades nacionais.",
          );
        }
      }
    }

    void loadNationalUnits();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  useEffect(() => {
    let cancelled = false;

    async function loadProvinces() {
      setLoadingProvinces(true);
      setError("");

      try {
        const result = await territorialUnitService.getProvinces();

        if (!cancelled) {
          setProvinces(result);
        }
      } catch (err) {
        if (!cancelled) {
          setProvinces([]);
          setError(
            err instanceof Error ? err.message : "Erro ao carregar províncias.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingProvinces(false);
        }
      }
    }

    void loadProvinces();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  useEffect(() => {
    if (!provinceId) {
      setMunicipalities([]);
      return;
    }

    let cancelled = false;

    async function loadMunicipalities() {
      setLoadingMunicipalities(true);
      setError("");

      try {
        const result =
          await territorialUnitService.getMunicipalities(provinceId);

        if (!cancelled) {
          setMunicipalities(result);
        }
      } catch (err) {
        if (!cancelled) {
          setMunicipalities([]);
          setError(
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
  }, [provinceId, refreshKey]);

  useEffect(() => {
    if (!municipalityId) {
      setCommunes([]);
      return;
    }

    let cancelled = false;

    async function loadCommunes() {
      setLoadingCommunes(true);
      setError("");

      try {
        const result = await territorialUnitService.getCommunes(municipalityId);

        if (!cancelled) {
          setCommunes(result);
        }
      } catch (err) {
        if (!cancelled) {
          setCommunes([]);
          setError(
            err instanceof Error ? err.message : "Erro ao carregar comunas.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingCommunes(false);
        }
      }
    }

    void loadCommunes();

    return () => {
      cancelled = true;
    };
  }, [municipalityId, refreshKey]);

  function handleProvinceChange(value: string) {
    setProvinceId(value);
    setMunicipalityId("");
    setMunicipalities([]);
    setCommunes([]);
    setError("");
  }

  function handleMunicipalityChange(value: string) {
    setMunicipalityId(value);
    setCommunes([]);
    setError("");
  }

  function handleRefresh() {
    setProvinceId("");
    setMunicipalityId("");
    setMunicipalities([]);
    setCommunes([]);
    setRefreshKey((value) => value + 1);
  }

  function handleTerritorialUnitCreated() {
    setSuccessMessage("Unidade territorial criada com sucesso!");
    setRefreshKey((current) => current + 1);
  }

  return (
    <div className="territorial-page">
      <div className="territorial-header">
        <div>
          <h2>Unidades Territoriais</h2>
          <p>
            Consulta da organização territorial por província, município e
            comuna.
          </p>
        </div>

        <button
          type="button"
          className="users-refresh-button"
          onClick={handleRefresh}
          disabled={loadingProvinces}
        >
          <RefreshCw size={17} />
          Actualizar
        </button>
      </div>

      {error && (
        <p className="change-password-error" role="alert">
          {error}
        </p>
      )}

      <div className="territorial-filters">
        <div className="field-group">
          <label htmlFor="territorial-province">Província</label>

          <select
            id="territorial-province"
            value={provinceId}
            onChange={(event) => handleProvinceChange(event.target.value)}
            disabled={loadingProvinces}
          >
            <option value="">
              {loadingProvinces
                ? "A carregar províncias..."
                : "Seleccionar província"}
            </option>

            {provinces.map((province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="territorial-municipality">Município</label>

          <select
            id="territorial-municipality"
            value={municipalityId}
            onChange={(event) => handleMunicipalityChange(event.target.value)}
            disabled={!provinceId || loadingMunicipalities}
          >
            <option value="">
              {loadingMunicipalities
                ? "A carregar municípios..."
                : "Seleccionar município"}
            </option>

            {municipalities.map((municipality) => (
              <option key={municipality.id} value={municipality.id}>
                {municipality.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="territorial-commune">Comuna</label>

          <select
            id="territorial-commune"
            defaultValue=""
            key={municipalityId}
            disabled={!municipalityId || loadingCommunes}
          >
            <option value="">
              {loadingCommunes ? "A carregar comunas..." : "Seleccionar comuna"}
            </option>

            {communes.map((commune) => (
              <option key={commune.id} value={commune.id}>
                {commune.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="territorial-summary">
        <div className="territorial-summary-icon">
          <MapPinned size={24} />
        </div>

        <div>
          <strong>Estrutura territorial</strong>

          <p>
            {provinces.length} província(s) carregada(s)
            {provinceId ? ` · ${municipalities.length} município(s)` : ""}
            {municipalityId ? ` · ${communes.length} comuna(s)` : ""}
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="user-created-success" role="status">
          {successMessage}
        </div>
      )}

      <TerritorialUnitForm
        nationalUnits={nationalUnits}
        provinces={provinces}
        onCreated={handleTerritorialUnitCreated}
      />
    </div>
  );
}
