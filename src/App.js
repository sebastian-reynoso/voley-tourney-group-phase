import React, { useState, useEffect } from "react";

const initialGroups = {
  Basico: [
    { name: "Magaly", wins: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "Pamela", wins: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "Yesica", wins: 0, pointsFor: 0, pointsAgainst: 0 },
  ],
  Intermedio: [
    { name: "Marco T.", wins: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "Cristian R.", wins: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "Jean Paul", wins: 0, pointsFor: 0, pointsAgainst: 0 },
  ],
};

export default function App() {
  const [groups, setGroups] = useState(initialGroups);
  const [matches, setMatches] = useState([]);

  // Cargar desde localStorage
  useEffect(() => {
    const savedGroups = localStorage.getItem("groups");
    const savedMatches = localStorage.getItem("matches");
    if (savedGroups) setGroups(JSON.parse(savedGroups));
    if (savedMatches) setMatches(JSON.parse(savedMatches));
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem("groups", JSON.stringify(groups));
    localStorage.setItem("matches", JSON.stringify(matches));
  }, [groups, matches]);

  // Registrar un partido
  const handleMatch = (group, team1, team2, score1, score2) => {
    const s1 = parseInt(score1, 10);
    const s2 = parseInt(score2, 10);
    if (!Number.isFinite(s1) || !Number.isFinite(s2)) return;

    if (s1 === s2) {
      alert("En fase de grupos es un solo set: no puede haber empate.");
      return;
    }

    const newGroups = JSON.parse(JSON.stringify(groups));

    const t1 = newGroups[group].find((t) => t.name === team1);
    const t2 = newGroups[group].find((t) => t.name === team2);

    // Actualizar puntos
    t1.pointsFor += s1;
    t1.pointsAgainst += s2;
    t2.pointsFor += s2;
    t2.pointsAgainst += s1;

    // Asignar victoria
    if (s1 > s2) t1.wins++;
    else t2.wins++;

    setGroups(newGroups);
    setMatches([...matches, { group, team1, team2, score1: s1, score2: s2 }]);
  };

  // Resetear todo
  const handleReset = () => {
    if (
      window.confirm(
        "¿Seguro que deseas reiniciar todo? Se perderán los datos."
      )
    ) {
      setGroups(JSON.parse(JSON.stringify(initialGroups)));
      setMatches([]);
      localStorage.removeItem("groups");
      localStorage.removeItem("matches");
    }
  };

  const calculateRanking = (group) => {
    return [...groups[group]].sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      const ratioA =
        a.pointsAgainst === 0 ? a.pointsFor : a.pointsFor / a.pointsAgainst;
      const ratioB =
        b.pointsAgainst === 0 ? b.pointsFor : b.pointsFor / b.pointsAgainst;
      return ratioB - ratioA;
    });
  };

  const rankingBasico = calculateRanking("Basico");
  const rankingIntermedio = calculateRanking("Intermedio");

  // Partidos por grupo
  const matchesBasico = matches.filter((m) => m.group === "Basico");
  const matchesIntermedio = matches.filter((m) => m.group === "Intermedio");

  return (
    <div className="p-4 max-w-md mx-auto font-sans bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-6 text-indigo-700">
        🏐 Torneo de Vóley
      </h1>

      {/* Botón Reiniciar */}
      <button
        className="bg-red-600 hover:bg-red-700 text-white font-semibold p-3 rounded-lg w-full mb-6 shadow-md transition"
        onClick={handleReset}
      >
        Reiniciar Todo
      </button>

      {/* Registrar partido */}
      <div className="bg-white shadow-lg rounded-xl p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          ➕ Registrar Partido
        </h2>
        <MatchForm onSubmit={handleMatch} groups={groups} />
      </div>

      {/* Tablas de posiciones */}
      <div className="grid gap-6">
        <div className="bg-white shadow-lg rounded-xl p-4">
          <h2 className="font-semibold text-blue-600 mb-2">📊 Grupo Básico</h2>
          <TableRanking teams={rankingBasico} />
        </div>
        <div className="bg-white shadow-lg rounded-xl p-4">
          <h2 className="font-semibold text-green-600 mb-2">
            📊 Grupo Intermedio
          </h2>
          <TableRanking teams={rankingIntermedio} />
        </div>
      </div>

      {/* Semifinales */}
      <div className="bg-white shadow-lg rounded-xl p-4 mt-6">
        <h2 className="text-lg font-semibold text-purple-600">
          🔜 Semifinales
        </h2>
        <div className="mt-2 space-y-1 text-gray-700">
          <p>
            {rankingBasico[0]?.name} <span className="font-bold">vs</span>{" "}
            {rankingIntermedio[1]?.name}
          </p>
          <p>
            {rankingIntermedio[0]?.name} <span className="font-bold">vs</span>{" "}
            {rankingBasico[1]?.name}
          </p>
        </div>
      </div>

      {/* Historial */}
      <div className="bg-white shadow-lg rounded-xl p-4 mt-6">
        <h2 className="text-lg font-semibold text-gray-700">📜 Historial</h2>

        {matches.length === 0 && (
          <p className="text-gray-500 mt-2">Aún no hay partidos registrados.</p>
        )}

        {matchesBasico.length > 0 && (
          <div className="mt-4">
            <h3 className="text-blue-600 font-semibold">Grupo Básico</h3>
            <ul className="mt-1 space-y-2">
              {matchesBasico.map((m, i) => (
                <li
                  key={i}
                  className="flex justify-between bg-blue-50 p-2 rounded-lg text-sm"
                >
                  <span>
                    {m.team1} ({m.score1}) vs {m.team2} ({m.score2})
                  </span>
                  <span className="font-bold text-blue-800">
                    🏆 {m.score1 > m.score2 ? m.team1 : m.team2}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {matchesIntermedio.length > 0 && (
          <div className="mt-4">
            <h3 className="text-green-600 font-semibold">Grupo Intermedio</h3>
            <ul className="mt-1 space-y-2">
              {matchesIntermedio.map((m, i) => (
                <li
                  key={i}
                  className="flex justify-between bg-green-50 p-2 rounded-lg text-sm"
                >
                  <span>
                    {m.team1} ({m.score1}) vs {m.team2} ({m.score2})
                  </span>
                  <span className="font-bold text-green-800">
                    🏆 {m.score1 > m.score2 ? m.team1 : m.team2}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Formulario para registrar partido
function MatchForm({ onSubmit, groups }) {
  const [group, setGroup] = useState("");
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");

  const availableTeams = group ? groups[group] : [];

  return (
    <div className="mt-3 space-y-3">
      <select
        value={group}
        onChange={(e) => {
          setGroup(e.target.value);
          setTeam1("");
          setTeam2("");
        }}
        className="border p-2 rounded-lg w-full"
      >
        <option value="">Selecciona Nivel</option>
        <option value="Basico">Basico</option>
        <option value="Intermedio">Intermedio</option>
      </select>

      <select
        value={team1}
        onChange={(e) => setTeam1(e.target.value)}
        className="border p-2 rounded-lg w-full"
        disabled={!group}
      >
        <option value="">Selecciona Equipo 1</option>
        {availableTeams.map((t) => (
          <option key={t.name} value={t.name}>
            {t.name}
          </option>
        ))}
      </select>

      <select
        value={team2}
        onChange={(e) => setTeam2(e.target.value)}
        className="border p-2 rounded-lg w-full"
        disabled={!group}
      >
        <option value="">Selecciona Equipo 2</option>
        {availableTeams.map((t) => (
          <option key={t.name} value={t.name}>
            {t.name}
          </option>
        ))}
      </select>

      <div className="flex gap-2">
        <input
          className="border p-2 rounded-lg w-1/2"
          placeholder="Puntos Eq1"
          type="number"
          min="0"
          value={score1}
          onChange={(e) => setScore1(e.target.value)}
          disabled={!group}
        />
        <input
          className="border p-2 rounded-lg w-1/2"
          placeholder="Puntos Eq2"
          type="number"
          min="0"
          value={score2}
          onChange={(e) => setScore2(e.target.value)}
          disabled={!group}
        />
      </div>

      <button
        className={`p-3 rounded-lg w-full font-semibold shadow-md transition ${
          !group || !team1 || !team2 || team1 === team2
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
        }`}
        onClick={() => {
          if (group && team1 && team2 && team1 !== team2) {
            onSubmit(group, team1, team2, score1, score2);
            setScore1("");
            setScore2("");
            setTeam1("");
            setTeam2("");
            setGroup(""); // Reinicia Nivel
          }
        }}
        disabled={!group || !team1 || !team2 || team1 === team2}
      >
        Guardar Partido
      </button>
    </div>
  );
}

// Tabla de ranking
function TableRanking({ teams }) {
  return (
    <table className="w-full mt-2 border rounded-lg overflow-hidden text-sm">
      <thead>
        <tr className="bg-gray-200 text-gray-700">
          <th className="p-2">Equipo</th>
          <th className="p-2">Victorias</th>
          <th className="p-2">Puntos +</th>
          <th className="p-2">Puntos -</th>
          <th className="p-2">Ratio</th>
        </tr>
      </thead>
      <tbody>
        {teams.map((t, i) => (
          <tr key={i} className="text-center border-t">
            <td className="p-2">{t.name}</td>
            <td className="p-2">{t.wins}</td>
            <td className="p-2">{t.pointsFor}</td>
            <td className="p-2">{t.pointsAgainst}</td>
            <td className="p-2">
              {(t.pointsAgainst === 0
                ? t.pointsFor
                : t.pointsFor / t.pointsAgainst
              ).toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
