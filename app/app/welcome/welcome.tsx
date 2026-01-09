import { useState } from "react";

export function Welcome() {
  const [message, setMessage] = useState("");

  const handlePost = async () => {
    try {
      const response = await fetch("http://localhost:5214/hand_comparisons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: "value" }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setMessage("Post successful!");
      // Handle success (e.g., redirect using useNavigate if needed)
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("Unknown Error", error);
      }
    }
  };

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <button
          className="
            inline-flex items-center justify-center
            rounded-md bg-slate-900
            px-4 py-2
            text-sm font-medium text-white
            shadow
            cursor-pointer hover:bg-slate-800
            active:bg-slate-700
            disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handlePost}
        >
          Send POST Request
        </button>
        <p>{message}</p>
      </div>
    </main>
  );
}
