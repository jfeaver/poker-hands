import { useState } from "react";

enum Suit {
  Diamonds = "D",
  Clubs = "C",
  Hearts = "H",
  Spades = "S",
}

enum Rank {
  Two = "2",
  Three = "3",
  Four = "4",
  Five = "5",
  Six = "6",
  Seven = "7",
  Eight = "8",
  Nine = "9",
  Ten = "10",
  Jack = "J",
  Queen = "Q",
  King = "K",
  Ace = "A",
}

enum HandTitle {
  HighCard = "High Card",
  Pair = "Pair",
  TwoPair = "Two Pairs",
  Trio = "Three of a Kind",
  Straight = "Straight",
  Flush = "Flush",
  FullHouse = "Full House",
  Quads = "Four of a Kind",
  StraightFlush = "Straight Flush",
}

interface Card {
  rank: Rank;
  suit: Suit;
}

interface PokerHand {
  playerId: string;
  hand: Array<Card>;
  title?: HandTitle;
  scoringCards?: Array<Card>;
}

export function Welcome() {
  const [pokerHands, setPokerHands] = useState<Array<PokerHand>>([]);
  const [winningHand, setWinningHand] = useState<PokerHand>();

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
      // TODO: Double check: The instructions said that output could be assumed to be well formed?
      setWinningHand(data);
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
          Who gets the pot?
        </button>
        {winningHand ? <p>{JSON.stringify(winningHand)}</p> : <></>}
      </div>
    </main>
  );
}
