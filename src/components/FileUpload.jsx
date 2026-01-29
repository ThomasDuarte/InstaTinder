import { useRef, useState } from "react";
import { parseInstagramCSV, parseInstagramJSON } from "../utils/csvParser";

function FileUpload({ onFilesLoaded }) {
  const [followingFile, setFollowingFile] = useState(null);
  const [followersFile, setFollowersFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState({
    following: false,
    followers: false,
  });

  const followingInputRef = useRef(null);
  const followersInputRef = useRef(null);

  const handleFileSelect = async (file, type) => {
    setError("");

    if (!file) return;

    const isJSON = file.name.endsWith(".json");
    const isCSV = file.name.endsWith(".csv");

    if (!isJSON && !isCSV) {
      setError("Format non supporté. Utilisez des fichiers JSON ou CSV.");
      return;
    }

    if (type === "following") {
      setFollowingFile(file);
    } else {
      setFollowersFile(file);
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setDragOver({ ...dragOver, [type]: false });

    const file = e.dataTransfer.files[0];
    handleFileSelect(file, type);
  };

  const handleProcess = async () => {
    if (!followingFile || !followersFile) {
      setError("Veuillez importer les deux fichiers.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const followingText = await followingFile.text();
      const followersText = await followersFile.text();

      let followingData, followersData;

      if (followingFile.name.endsWith(".json")) {
        followingData = parseInstagramJSON(followingText, "following");
      } else {
        followingData = parseInstagramCSV(followingText);
      }

      if (followersFile.name.endsWith(".json")) {
        followersData = parseInstagramJSON(followersText, "followers");
      } else {
        followersData = parseInstagramCSV(followersText);
      }

      if (followingData.length === 0 || followersData.length === 0) {
        throw new Error("Les fichiers semblent vides ou mal formatés.");
      }

      onFilesLoaded(followingData, followersData);
    } catch (err) {
      setError(`Erreur lors du traitement: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const DropZone = ({ type, file, inputRef, label, icon }) => (
    <div
      className={`drop-zone rounded-2xl p-8 text-center cursor-pointer transition-all ${
        dragOver[type] ? "dragging" : ""
      } ${file ? "bg-green-50 border-green-400" : "bg-white/80"}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver({ ...dragOver, [type]: true });
      }}
      onDragLeave={() => setDragOver({ ...dragOver, [type]: false })}
      onDrop={(e) => handleDrop(e, type)}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.json"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files[0], type)}
      />

      <div
        className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
          file
            ? "bg-green-500"
            : "bg-gradient-to-br from-pink-500 to-purple-600"
        }`}
      >
        {file ? (
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <span className="text-2xl">{icon}</span>
        )}
      </div>

      <h3 className="font-semibold text-gray-800 mb-2">{label}</h3>

      {file ? (
        <p className="text-green-600 text-sm font-medium">{file.name}</p>
      ) : (
        <p className="text-gray-500 text-sm">
          Glissez-déposez ou cliquez pour sélectionner
        </p>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Importez vos données Instagram
          </h2>
          <p className="text-gray-600">
            Téléchargez vos données depuis Instagram puis importez les fichiers
            ici
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Comment obtenir vos données ?
          </h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Allez sur Instagram → Paramètres → Compte</li>
            <li>Cliquez sur "Télécharger vos données"</li>
            <li>Sélectionnez le format JSON</li>
            <li>
              Récupérez les fichiers{" "}
              <code className="bg-blue-100 px-1 rounded">following.json</code>{" "}
              et{" "}
              <code className="bg-blue-100 px-1 rounded">followers.json</code>
            </li>
          </ol>
        </div>

        {/* Drop zones */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <DropZone
            type="following"
            file={followingFile}
            inputRef={followingInputRef}
            label="Abonnements (Following)"
            icon="👥"
          />
          <DropZone
            type="followers"
            file={followersFile}
            inputRef={followersInputRef}
            label="Abonnés (Followers)"
            icon="❤️"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">
            <p className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </p>
          </div>
        )}

        {/* Process button */}
        <button
          onClick={handleProcess}
          disabled={!followingFile || !followersFile || loading}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
            followingFile && followersFile && !loading
              ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg hover:scale-[1.02]"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Analyse en cours...
            </span>
          ) : (
            "Analyser mes données"
          )}
        </button>
      </div>
    </div>
  );
}

export default FileUpload;
