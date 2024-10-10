import { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SendIcon, Loader2, Bot, User } from "lucide-react";
import SideBarPhone from "../../components/ui/sidebarPhone";
import SideBar from "../../components/ui/sidebar";
import CrateCard from "../../components/CrateCard";
import useCrateCharts from "../explorecrate/useCrateCharts";

interface UserInfo {
  age: string;
  salary: string;
  familyMembers: string;
  netWorth: string;
}

interface ChatMessage {
  type: "user" | "bot";
  message: string;
}

export default function SickAi() {
  const [inputValue, setInputValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    age: "",
    salary: "",
    familyMembers: "",
    netWorth: "",
  });
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [allCrates, setAllCrates] = useState<any[]>([]); // Initialized as empty array
  const [suggestCrate, setSuggestedCrate] = useState<any | null>(null); // Typed properly
  const { chartsData, weightedPriceChanges } = useCrateCharts(allCrates);

  console.log(allCrates);
  const genAI = new GoogleGenerativeAI(
    import.meta.env.VITE_GEMINI_KEY as string
  );

  const fetchCrates = async (): Promise<any[]> => {
    try {
      const response = await fetch("https://sickb.vercel.app/api/crates");
      if (!response.ok) {
        throw new Error("Failed to fetch crates");
      }
      const data: any[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching crates:", error);
      return [];
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setInputValue(e.target.value);
  };

  const handleUserInfoSubmit = (): void => {
    const steps = ["age", "salary", "familyMembers", "netWorth"];
    const currentField = steps[currentStep];
    setUserInfo((prevState) => ({
      ...prevState,
      [currentField]: inputValue,
    }));
    setChatHistory((prevHistory) => [
      ...prevHistory,
      { type: "user", message: inputValue },
      { type: "bot", message: getNextQuestion() },
    ]);
    setInputValue("");
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(currentStep + 1);
      getResponseForGivenPrompt();
    }
  };

  const getNextQuestion = (): string => {
    const questions = [
      "Great! Now, what's your annual salary?",
      "Thanks! How many family members do you have?",
      "Almost done! What's your estimated net worth?",
      "Thank you for providing all the information. I'll now analyze the best crates for you based on your profile.",
    ];
    return questions[currentStep];
  };

  const getResponseForGivenPrompt = async (): Promise<void> => {
    try {
      setLoading(true);
      const crates = await fetchCrates();
      console.log("Fetched Crates:", crates);
      setAllCrates(crates); // Sets state, but we will use 'crates' directly below

      // Function to get token data
      async function getTokenData(tokens: string[]): Promise<string> {
        if (!Array.isArray(tokens) || tokens.length === 0) {
          return "empty crate";
        }
        const formatToken = (token: string): string => {
          return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
        };
        try {
          const tokenPrices = await Promise.all(
            tokens.map(async (token) => {
              const formattedToken = formatToken(token);
              const response = await fetch(
                `https://price.jup.ag/v6/price?ids=${formattedToken}`
              );
              const data = await response.json();
              return `${formattedToken}: ${
                data[formattedToken]?.price || "N/A"
              }`;
            })
          );
          return tokenPrices.join(", ");
        } catch (error) {
          console.error("Error fetching token prices:", error);
          return "empty crate";
        }
      }

      const cratesData = (
        await Promise.all(
          crates.map(async (crate) => {
            const tokenData = await getTokenData(crate.token);
            return `id: ${crate.id}, name: ${crate.name}, token data: ${tokenData}`;
          })
        )
      ).join("; ");

      console.log("Transformed Crates Data:", cratesData);

      const inputPromptText = `Based on the following user profile details, recommend the most suitable single crate from the available options: Age: ${userInfo.age}, Annual Salary: ${userInfo.salary}, Number of Family Members: ${userInfo.familyMembers}, and Net Worth: ${userInfo.netWorth}. Consider these crates: ${cratesData}. Please return the names of crates that best match this user's financial profile and investment needs. It should be a single crate id.`;

      console.log("AI Prompt:", inputPromptText);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(inputPromptText);

      const response = result.response;
      const text = await response.text(); // Ensure we await the text

      // Assuming the AI returns the crate id as plain text
      const crateId = text.trim(); // Remove any extra whitespace
      const matchingCrate = crates.find((crate) => crate.id === crateId);

      if (matchingCrate) {
        setSuggestedCrate(matchingCrate); // Store the matched crate
        setChatHistory((prevHistory) => [
          ...prevHistory,
          {
            type: "bot",
            message: `Based on your profile, we recommend the crate: ${matchingCrate.name}`,
          },
        ]);
      } else {
        setChatHistory((prevHistory) => [
          ...prevHistory,
          {
            type: "bot",
            message:
              "I'm sorry, but I couldn't find a matching crate based on your input.",
          },
        ]);
      }

      console.log("AI Response Text:", text);
      setLoading(false);
    } catch (error) {
      console.error("Error in getResponseForGivenPrompt:", error);
      setLoading(false);
      setChatHistory((prevHistory) => [
        ...prevHistory,
        {
          type: "bot",
          message:
            "I'm sorry, but I encountered an error while processing your request. Please try again later.",
        },
      ]);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    setChatHistory([
      {
        type: "bot",
        message:
          "Hello! To help you find the best crates, I need some information. First, could you tell me your age?",
      },
    ]);
  }, []);

  // Use useEffect to log suggestCrate whenever it updates
  useEffect(() => {
    if (suggestCrate) {
      console.log("Suggested Crate:", suggestCrate);
    }
  }, [suggestCrate]);
  return (
    <div>
      <div className="mx-4"></div>
      <div className="flex md:ml-20 md:mb-0 mb-20 flex-col h-[82vh] bg-[#02050A] text-gray-200">
        <div className="flex-1 overflow-hidden">
          <div
            className="h-full overflow-y-auto px-4 py-6"
            ref={chatContainerRef}
          >
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`flex ${
                  chat.type === "user" ? "justify-end" : "justify-start"
                } mb-4`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[70%] ${
                    chat.type === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex-shrink-0 flex">
                    {chat.type === "user" ? (
                      <div className="w-8 h-8 ml-2 bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-300" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                        <Bot className="h-5 w-5 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div
                    className={`rounded-xl px-4 py-2 ${
                      chat.type === "user"
                        ? "bg-[#A4E734] text-[#02050A]"
                        : "bg-gray-800 text-gray-200"
                    }`}
                  >
                    {chat.message}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-center items-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#A4E734]" />
              </div>
            )}
          </div>
        </div>
        {suggestCrate && (
          <div className="ml-10">
            <a
              href={`/crates/${suggestCrate.id}`}
              className="transform transition-all duration-300 hover:scale-105"
              key={suggestCrate.id}
            >
              <CrateCard
                chartData={chartsData[suggestCrate?.id]}
                title={suggestCrate?.name}
                creator={suggestCrate?.creator.name}
                subtitle={`Created: ${new Date(
                  suggestCrate?.createdAt
                ).toLocaleDateString()}`}
                percentage={0}
                tokens={suggestCrate?.tokens}
                weightedPriceChange={
                  weightedPriceChanges[suggestCrate?.id] || 0
                } // Placeholder
                upvotes={suggestCrate?.upvotes}
                downvotes={suggestCrate?.downvotes}
              />
            </a>
          </div>
        )}
        <div className="bg-gray-900 border-t border-gray-800 px-4 py-4">
          <div className="flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={
                currentStep < 4
                  ? "Type your answer here..."
                  : "Ask me anything about the recommended crates"
              }
              className="flex-1 bg-gray-800 text-gray-200 border border-gray-700 rounded-l-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#A4E734]"
              onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleUserInfoSubmit();
                }
              }}
            />
            <button
              onClick={handleUserInfoSubmit}
              className="bg-[#A4E734] text-black rounded-r-xl px-4 py-2 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-[#A4E734] flex items-center"
            >
              <SendIcon className="h-5 w-5 mr-2" />
              Send
            </button>
          </div>
        </div>

        <SideBarPhone />
        <SideBar />
      </div>
    </div>
  );
}
