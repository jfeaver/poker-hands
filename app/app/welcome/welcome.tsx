import { useState } from "react";

enum Suit {
  Diamonds = "Diamonds",
  Clubs = "Clubs",
  Hearts = "Hearts",
  Spades = "Spades",
}

enum Rank {
  Two = "Two",
  Three = "Three",
  Four = "Four",
  Five = "Five",
  Six = "Six",
  Seven = "Seven",
  Eight = "Eight",
  Nine = "Nine",
  Ten = "Ten",
  Jack = "Jack",
  Queen = "Queen",
  King = "King",
  Ace = "Ace",
}

enum HandTitle {
  HighCard = "HighCard",
  Pair = "Pair",
  TwoPair = "TwoPair",
  Trips = "Trips",
  Straight = "Straight",
  Flush = "Flush",
  FullHouse = "FullHouse",
  Quads = "Quads",
  StraightFlush = "StraightFlush",
}

interface Card {
  Rank: Rank;
  Suit: Suit;
}

interface PokerHand {
  PlayerId: string;
  Hand: Array<Card>;
  Title?: HandTitle;
  ScoringCards?: Array<Card>;
}

function handTitle(hand: PokerHand) {
  switch (hand.Title) {
    case HandTitle.HighCard:
      return "a high card";
    case HandTitle.Pair:
      return "one pair";
    case HandTitle.TwoPair:
      return "two pairs";
    case HandTitle.Trips:
      return "three of a kind";
    case HandTitle.Straight:
      return "a straight";
    case HandTitle.Flush:
      return "a flush";
    case HandTitle.FullHouse:
      return "a full house";
    case HandTitle.Quads:
      return "four of a kind";
    case HandTitle.StraightFlush:
      return "a straight flush";
  }
}

function WinningHand({ hand }: { hand: PokerHand }) {
  console.log({ hand });
  return (
    <div>
      <h3>{hand.PlayerId} Wins!</h3>
      <p>
        {hand.PlayerId} wins with {handTitle(hand)}:{" "}
        {JSON.stringify(hand.ScoringCards)}
      </p>
    </div>
  );
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
        body: JSON.stringify(pokerHands),
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

  const tedVsLouis = () => {
    setPokerHands([
      {
        PlayerId: "Ted",
        Hand: [
          { Rank: Rank.Two, Suit: Suit.Hearts },
          { Rank: Rank.Three, Suit: Suit.Diamonds },
          { Rank: Rank.Five, Suit: Suit.Spades },
          { Rank: Rank.Nine, Suit: Suit.Clubs },
          { Rank: Rank.King, Suit: Suit.Diamonds },
        ],
      },
      {
        PlayerId: "Louis",
        Hand: [
          { Rank: Rank.Two, Suit: Suit.Clubs },
          { Rank: Rank.Three, Suit: Suit.Hearts },
          { Rank: Rank.Four, Suit: Suit.Spades },
          { Rank: Rank.Eight, Suit: Suit.Clubs },
          { Rank: Rank.Ace, Suit: Suit.Hearts },
        ],
      },
    ]);
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
          onClick={tedVsLouis}
        >
          Ted vs Louis
        </button>
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
          disabled={pokerHands.length ? undefined : true}
          onClick={handlePost}
        >
          Who gets the pot?
        </button>
        {winningHand ? <WinningHand hand={winningHand} /> : <></>}
      </div>
    </main>
  );
}
