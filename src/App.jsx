import { Component, useEffect, useState } from "react";
import FileUpload from "./components/FileUpload";
import Header from "./components/Header";
import Results from "./components/Results";
import SwipeCard from "./components/SwipeCard";
import { findNonFollowers } from "./utils/csvParser";
import { loadFromStorage, saveToStorage } from "./utils/storage";

// Error Boundary pour capturer les erreurs
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Erreur capturée:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-100 flex items-center justify-center p-8">
          <div className="bg-white rounded-xl p-8 max-w-lg shadow-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Une erreur est survenue
            </h1>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
            >
              Recharger
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [step, setStep] = useState("upload"); // 'upload' | 'swipe' | 'results'
  const [nonFollowers, setNonFollowers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [decisions, setDecisions] = useState({ unfollow: [], keep: [] });
  const [stats, setStats] = useState({ total: 0, processed: 0 });

  // Load saved progress on mount
  useEffect(() => {
    const savedData = loadFromStorage();
    if (savedData) {
      setNonFollowers(savedData.nonFollowers || []);
      setCurrentIndex(savedData.currentIndex || 0);
      setDecisions(savedData.decisions || { unfollow: [], keep: [] });
      setStats(savedData.stats || { total: 0, processed: 0 });
      if (savedData.nonFollowers?.length > 0) {
        if (savedData.currentIndex >= savedData.nonFollowers.length) {
          setStep("results");
        } else {
          setStep("swipe");
        }
      }
    }
  }, []);

  // Save progress on changes
  useEffect(() => {
    if (nonFollowers.length > 0) {
      saveToStorage({ nonFollowers, currentIndex, decisions, stats });
    }
  }, [nonFollowers, currentIndex, decisions, stats]);

  const handleFilesLoaded = (followingData, followersData) => {
    const result = findNonFollowers(followingData, followersData);
    setNonFollowers(result);
    setStats({ total: result.length, processed: 0 });
    setCurrentIndex(0);
    setDecisions({ unfollow: [], keep: [] });
    setStep("swipe");
  };

  const handleSwipe = (direction, user) => {
    if (direction === "left") {
      setDecisions((prev) => ({
        ...prev,
        unfollow: [...prev.unfollow, user],
      }));
    } else {
      setDecisions((prev) => ({
        ...prev,
        keep: [...prev.keep, user],
      }));
    }

    setStats((prev) => ({ ...prev, processed: prev.processed + 1 }));

    if (currentIndex >= nonFollowers.length - 1) {
      setStep("results");
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setNonFollowers([]);
    setCurrentIndex(0);
    setDecisions({ unfollow: [], keep: [] });
    setStats({ total: 0, processed: 0 });
    localStorage.removeItem("instaTinder");
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevUser = nonFollowers[prevIndex];

      setDecisions((prev) => ({
        unfollow: prev.unfollow.filter((u) => u.username !== prevUser.username),
        keep: prev.keep.filter((u) => u.username !== prevUser.username),
      }));

      setStats((prev) => ({ ...prev, processed: prev.processed - 1 }));
      setCurrentIndex(prevIndex);

      if (step === "results") {
        setStep("swipe");
      }
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
        <Header
          step={step}
          stats={stats}
          onReset={handleReset}
          canUndo={currentIndex > 0}
          onUndo={handleUndo}
        />

        <main className="container mx-auto px-4 py-8">
          {step === "upload" && (
            <FileUpload onFilesLoaded={handleFilesLoaded} />
          )}

          {step === "swipe" && nonFollowers.length > 0 && (
            <SwipeCard
              users={nonFollowers}
              currentIndex={currentIndex}
              onSwipe={handleSwipe}
              stats={stats}
            />
          )}

          {step === "results" && (
            <Results decisions={decisions} onReset={handleReset} />
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
