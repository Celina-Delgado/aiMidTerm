import { useEffect, useMemo, useState } from "react"
import { projectId, publicAnonKey } from "../utils/supabase/info"

type IconName = "home" | "clock" | "chart" | "heart" | "settings" | "moon" | "users" | "walk" | "spark" | "close" | "check" | "arrow" | "game"

type Recommendation = {
  id: number
  title: string
  description: string
  duration: string
  distance: string
  tags: string[]
  image: string
  imagePosition?: string
  context: string
  setting: "Indoor" | "Outdoor"
  availableFrom: number
  availableUntil: number
  requiresLocation?: boolean
}

const recommendations: Recommendation[] = [
  {
    id: 1,
    title: "Take a loop around your neighborhood",
    description:
      "A low-effort reset that starts at your door. Text someone nearby and turn it into a catch-up.",
    duration: "25 min",
    distance: "Starts at your door",
    tags: ["Outdoors", "Social"],
    image:
      "https://images.unsplash.com/photo-1626945804729-e71244c9dda5?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200&h=900",
    context: "Fits your local time",
    setting: "Outdoor",
    availableFrom: 6,
    availableUntil: 22,
  },
  {
    id: 2,
    title: "Make tea and read ten pages",
    description:
      "No productivity goal. Just give your eyes and nervous system a quieter kind of input.",
    duration: "20 min",
    distance: "At home",
    tags: ["Quiet", "Solo"],
    image:
      "https://images.unsplash.com/photo-1414124488080-0188dcbb8834?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200&h=900",
    context: "Best for late evenings",
    setting: "Indoor",
    availableFrom: 0,
    availableUntil: 24,
  },
  {
    id: 3,
    title: "Find an open rec court nearby",
    description:
      "Invite a friend or head over solo. We’ll only surface this while local courts are likely open.",
    duration: "45 min",
    distance: "Search nearby",
    tags: ["Active", "Social"],
    image:
      "https://images.unsplash.com/photo-1562552052-dbdd31c06339?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200&h=900",
    context: "Nearby option",
    setting: "Outdoor",
    availableFrom: 8,
    availableUntil: 20,
    requiresLocation: true,
  },
  {
    id: 4,
    title: "Do a five-minute floor reset",
    description:
      "Stretch your hips, shoulders, and hands—then decide whether you still want another match.",
    duration: "5 min",
    distance: "At home",
    tags: ["Quick", "Active"],
    image:
      "https://images.unsplash.com/photo-1758599879024-7379d769f664?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200&h=900",
    context: "Easy to start right now",
    setting: "Indoor",
    availableFrom: 0,
    availableUntil: 24,
  },
]

const interestOptions = [
  "Fresh air",
  "Seeing friends",
  "Quick movement",
  "Quiet reset",
  "Food & drink",
  "Creative",
]

const playProfileQuestions = [
  {
    title: "How long have you been a gamer?",
    helper:
      "A rough answer is perfect—this gives us context for how gaming fits into your life.",
    placeholder: "I started gaming when…",
  },
  {
    title:
      "Think about your most recent long gaming session. How did it unfold?",
    helper:
      "What did you do first, what happened next, and how did the session eventually end?",
    placeholder: "I started by… Then…",
  },
  {
    title: "How do you prefer to spend your time in-game, and why?",
    helper:
      "For example: competitive matches, grinding for loot, exploring, or socializing.",
    placeholder: "I usually enjoy… because…",
  },
  {
    title: "What makes it difficult to track or limit your gaming time?",
    helper:
      "Think about the game itself, your surroundings, and anything that makes time easy to lose.",
    placeholder: "It becomes difficult when…",
  },
  {
    title:
      "When are you most likely to keep playing past your planned stop time?",
    helper:
      "It could be a particular mood, social situation, match, or unfinished goal.",
    placeholder: "I tend to keep playing when…",
  },
  {
    title:
      "What feels most frustrating about managing or stepping away from gaming?",
    helper: "Share what feels confusing, difficult, or time-consuming.",
    placeholder: "The hardest part is…",
  },
]

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    home: (
      <>
        <path d="m3 10 7-6 7 6" />
        <path d="M5 9v8h10V9M8 17v-5h4v5" />
      </>
    ),
    clock: (
      <>
        <circle cx="10" cy="10" r="7" />
        <path d="M10 6v4l3 2" />
      </>
    ),
    chart: (
      <>
        <path d="M4 16V9m6 7V4m6 12v-6" />
      </>
    ),
    heart: (
      <path d="M10 17S3.5 13.4 3.5 8.4c0-3.2 4-4.4 6.5-1.5 2.5-2.9 6.5-1.7 6.5 1.5 0 5-6.5 8.6-6.5 8.6Z" />
    ),
    settings: (
      <>
        <circle cx="10" cy="10" r="2.5" />
        <path d="M10 2.8v2M10 15.2v2M17.2 10h-2M4.8 10h-2M15.1 4.9l-1.4 1.4M6.3 13.7l-1.4 1.4M15.1 15.1l-1.4-1.4M6.3 6.3 4.9 4.9" />
      </>
    ),
    moon: <path d="M15.8 12.8A6.5 6.5 0 0 1 7.2 4.2a6.5 6.5 0 1 0 8.6 8.6Z" />,
    users: (
      <>
        <circle cx="7" cy="7.5" r="2.3" />
        <circle cx="14.5" cy="8" r="1.8" />
        <path d="M2.8 16c.5-3.2 2-4.5 4.3-4.5s3.8 1.3 4.3 4.5M12.2 12.3c2.8-.7 4.6.6 5 3.1" />
      </>
    ),
    walk: (
      <>
        <circle cx="11.5" cy="3.5" r="1.5" />
        <path d="m9 8 2-2 2 2 2.5 1M11 6l-1 5-3 2M10 11l3 2 1 4M7 13l-2 4" />
      </>
    ),
    spark: (
      <>
        <path d="m10 2 1.2 4.3L15 8l-3.8 1.7L10 14l-1.2-4.3L5 8l3.8-1.7L10 2Z" />
        <path d="m16 13 .6 2 .9.4-.9.5-.6 2-.6-2-.9-.5.9-.4.6-2Z" />
      </>
    ),
    close: <path d="m5 5 10 10M15 5 5 15" />,
    check: <path d="m4 10 4 4 8-8" />,
    arrow: <path d="M4 10h12m-4-4 4 4-4 4" />,
    game: (
      <>
        <path d="M6.5 7h7c2 0 3 1.2 3.5 3.4l.7 3.2c.5 2.3-1.9 3.2-3.1 1.4l-1.3-2H6.7l-1.3 2c-1.2 1.8-3.6.9-3.1-1.4l.7-3.2C3.5 8.2 4.5 7 6.5 7Z" />
        <path d="M6.5 9v3M5 10.5h3M13 10h.1M15 11.5h.1" />
      </>
    ),
  }

  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

function Logo() {
  return (
    <div className="logo">
      <span>
        <Icon name="spark" />
      </span>
      <strong>GameToReality</strong>
    </div>
  )
}

function loadArray(key: string, fallback: string[]) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    const savedEnd = Number(localStorage.getItem("sidequest-session-end"))
    if (savedEnd > Date.now()) return "Today"
    return localStorage.getItem("sidequest-play-profile-complete") === "true"
      ? "Plan"
      : "Questions"
  })
  const [cardIndex, setCardIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [generatingIdeas, setGeneratingIdeas] = useState(false)
  const [recommendationError, setRecommendationError] = useState("")
  const [aiRecommendations, setAiRecommendations] = useState<Recommendation[]>([])
  const [feedback, setFeedback] = useState<Record<number, "liked" | "passed">>(
    () => {
      try {
        return JSON.parse(localStorage.getItem("sidequest-feedback") || "{}")
      } catch {
        return {}
      }
    },
  )
  const [interests, setInterests] = useState<string[]>(() =>
    loadArray("sidequest-interests", [
      "Fresh air",
      "Seeing friends",
      "Quick movement",
    ]),
  )
  const [activitySetting, setActivitySetting] = useState(
    () => localStorage.getItem("sidequest-activity-setting") || "Either",
  )
  const [plannedMinutes, setPlannedMinutes] = useState(
    () => Number(localStorage.getItem("sidequest-planned-minutes")) || 90,
  )
  const [futureMessage, setFutureMessage] = useState(
    () =>
      localStorage.getItem("sidequest-future-message") ||
      "You have class tomorrow. End on a win and get some rest.",
  )
  const [followUpReminders, setFollowUpReminders] = useState(
    () => localStorage.getItem("sidequest-follow-up-reminders") !== "false",
  )
  const [selectedGame, setSelectedGame] = useState(
    () => localStorage.getItem("sidequest-selected-game") || "",
  )
  const [planSaved, setPlanSaved] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [profileQuestion, setProfileQuestion] = useState(0)
  const [profileAnswers, setProfileAnswers] = useState<string[]>(() =>
    loadArray(
      "sidequest-play-profile",
      Array(playProfileQuestions.length).fill(""),
    ),
  )
  const [profileSaved, setProfileSaved] = useState(
    () => localStorage.getItem("sidequest-play-profile-complete") === "true",
  )
  const [now, setNow] = useState(Date.now())
  const [sessionEnd, setSessionEnd] = useState<number | null>(() => {
    const saved = Number(localStorage.getItem("sidequest-session-end"))
    return saved > Date.now() ? saved : null
  })
  const [sessionStart, setSessionStart] = useState<number | null>(() => {
    const saved = Number(localStorage.getItem("sidequest-session-start"))
    return saved || null
  })
  const [showTimeUp, setShowTimeUp] = useState(false)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [sessionCompleted, setSessionCompleted] = useState(false)
  const [locationStatus, setLocationStatus] =
    useState<"idle" | "loading" | "granted" | "denied">("idle")
  const [userLocation, setUserLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [profileName, setProfileName] = useState(
    () => localStorage.getItem("sidequest-profile-name") || "Jordan Diaz",
  )
  const [profileGoal, setProfileGoal] = useState(
    () =>
      localStorage.getItem("sidequest-profile-goal") ||
      "Enjoy gaming without letting it crowd out sleep, movement, and time with friends.",
  )
  const [profileDetailsSaved, setProfileDetailsSaved] = useState(false)

  useEffect(() => {
    localStorage.setItem("sidequest-feedback", JSON.stringify(feedback))
  }, [feedback])

  useEffect(() => {
    localStorage.setItem("sidequest-interests", JSON.stringify(interests))
  }, [interests])

  useEffect(() => {
    localStorage.setItem("sidequest-activity-setting", activitySetting)
  }, [activitySetting])

  useEffect(() => {
    localStorage.setItem(
      "sidequest-follow-up-reminders",
      String(followUpReminders),
    )
  }, [followUpReminders])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (sessionEnd && now >= sessionEnd) {
      setSessionCompleted(true)
      setShowTimeUp(true)
      setSessionEnd(null)
      localStorage.removeItem("sidequest-session-end")
    }
  }, [now, sessionEnd])

  const localHour = new Date(now).getHours()
  const eligibleRecommendations = useMemo(() => {
    const sourceRecommendations =
      aiRecommendations.length > 0 ? aiRecommendations : recommendations

    const timeAndPlaceMatches = sourceRecommendations.filter((item) => {
      const isOpenNow =
        localHour >= item.availableFrom && localHour < item.availableUntil
      const settingMatches =
        activitySetting === "Either" || item.setting === activitySetting
      const hasNeededLocation = !item.requiresLocation || userLocation !== null
      return isOpenNow && settingMatches && hasNeededLocation
    })

    if (timeAndPlaceMatches.length > 0) return timeAndPlaceMatches

    return sourceRecommendations.filter(
      (item) =>
        item.setting === "Indoor" &&
        item.availableFrom === 0 &&
        item.availableUntil === 24,
    )
  }, [activitySetting, aiRecommendations, localHour, userLocation])
  const card =
    eligibleRecommendations[cardIndex % eligibleRecommendations.length]
  const likedCount = Object.values(feedback).filter(
    (value) => value === "liked",
  ).length
  const isLate = localHour < 6 || localHour >= 22
  const contextLabel = isLate ? "Late-night mode" : "Made for this moment"

  const respond = (choice: "liked" | "passed") => {
    setFeedback((previous) => ({ ...previous, [card.id]: choice }))
    setLoading(true)
    window.setTimeout(() => {
      setCardIndex((value) => (value + 1) % eligibleRecommendations.length)
      setLoading(false)
    }, 650)
  }

  const toggleInterest = (interest: string) => {
    setInterests((previous) =>
      previous.includes(interest)
        ? previous.filter((item) => item !== interest)
        : [...previous, interest],
    )
  }

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("denied")
      return
    }

    setLocationStatus("loading")
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setLocationStatus("granted")
        setCardIndex(0)
      },
      () => {
        setLocationStatus("denied")
        setUserLocation(null)
      },
      { enableHighAccuracy: false, maximumAge: 10 * 60 * 1000, timeout: 8000 },
    )
  }

  const generateRecommendations = async () => {
    if (generatingIdeas) return

    setGeneratingIdeas(true)
    setRecommendationError("")

    try {
      const recommendationPool = [...aiRecommendations, ...recommendations]
      const likedActivities = recommendationPool
        .filter((item) => feedback[item.id] === "liked")
        .map((item) => item.title)
      const passedActivities = recommendationPool
        .filter((item) => feedback[item.id] === "passed")
        .map((item) => item.title)

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/recommendations`,
        {
          method: "POST",
          headers: {
            apikey: publicAnonKey,
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            localTime: new Date(now).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            }),
            dayOfWeek: new Date(now).toLocaleDateString([], {
              weekday: "long",
            }),
            activitySetting,
            interests,
            selectedGame,
            locationEnabled: Boolean(userLocation),
            latitude: userLocation?.latitude ?? null,
            longitude: userLocation?.longitude ?? null,
            playProfile: profileAnswers.filter((answer) => answer.trim()),
            likedActivities,
            passedActivities,
          }),
        },
      )

      const rawText = await response.text()
      let payload: any = {}

      if (rawText) {
        try {
          payload = JSON.parse(rawText)
        } catch {
          throw new Error(
            response.ok
              ? "The recommendation service returned an unexpected response."
              : `Recommendation request failed (${response.status}).`,
          )
        }
      }

      if (payload.error) {
        setRecommendationError(payload.error)
      }

      if (!response.ok || !Array.isArray(payload.recommendations)) {
        throw new Error(payload.error || "Could not generate recommendations.")
      }

      const indoorImage =
        "https://images.unsplash.com/photo-1414124488080-0188dcbb8834?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200&h=900"
      const outdoorImage =
        "https://images.unsplash.com/photo-1626945804729-e71244c9dda5?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200&h=900"
      const generated = payload.recommendations.map(
        (
          item: {
            title: string
            description: string
            duration: string
            setting: "Indoor" | "Outdoor"
            tags: string[]
            reason: string
          },
          index: number,
        ): Recommendation => ({
          id: Date.now() + index,
          title: item.title,
          description: item.description,
          duration: item.duration,
          distance: item.setting === "Outdoor" ? "Starts nearby" : "At home",
          tags: item.tags.length ? item.tags : [item.setting, "Personalized"],
          image: item.setting === "Outdoor" ? outdoorImage : indoorImage,
          context: item.reason,
          setting: item.setting,
          availableFrom: 0,
          availableUntil: 24,
        }),
      )

      setAiRecommendations(generated)
      setCardIndex(0)
    } catch (error) {
      console.error("recommendation generation failed", error)
      setRecommendationError(
        error instanceof Error
          ? error.message
          : "Fresh recommendations are unavailable right now.",
      )
      setAiRecommendations([])
    } finally {
      setGeneratingIdeas(false)
    }
  }

  const updateProfileAnswer = (value: string) => {
    setProfileAnswers((previous) => {
      const next = [...previous]
      next[profileQuestion] = value
      return next
    })
  }

  const openPlayProfile = () => {
    setShowPreferences(false)
    setProfileQuestion(0)
    setActiveTab("Questions")
  }

  const continueProfile = () => {
    localStorage.setItem(
      "sidequest-play-profile",
      JSON.stringify(profileAnswers),
    )
    if (profileQuestion < playProfileQuestions.length - 1) {
      setProfileQuestion((value) => value + 1)
      return
    }
    localStorage.setItem("sidequest-play-profile-complete", "true")
    setProfileSaved(true)
    setActiveTab(sessionEnd ? "Today" : "Plan")
  }

  const feedbackRows = useMemo(
    () =>
      recommendations
        .filter((item) => feedback[item.id])
        .map((item) => ({
          ...item,
          choice: feedback[item.id],
        })),
    [feedback],
  )
  const answeredProfileQuestions = profileAnswers.filter((answer) =>
    answer.trim(),
  ).length

  const remainingSeconds = sessionEnd
    ? Math.max(0, Math.ceil((sessionEnd - now) / 1000))
    : 0
  const remainingHours = Math.floor(remainingSeconds / 3600)
  const remainingMinutes = Math.floor((remainingSeconds % 3600) / 60)
  const remainingSecondsPart = remainingSeconds % 60
  const plannedSeconds = plannedMinutes * 60
  const timerProgress = sessionEnd
    ? Math.min(
        100,
        Math.max(
          2,
          ((plannedSeconds - remainingSeconds) / plannedSeconds) * 100,
        ),
      )
    : 0
  const startLabel = sessionStart
    ? new Date(sessionStart).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    : "Not started"

  const savePlan = () => {
    if (sessionEnd || !selectedGame.trim()) return
    const start = Date.now()
    const end = start + plannedMinutes * 60 * 1000
    setNow(start)
    setSessionStart(start)
    setSessionEnd(end)
    setPlanSaved(true)
    setSessionCompleted(false)
    setShowTimeUp(false)
    localStorage.setItem("sidequest-planned-minutes", String(plannedMinutes))
    localStorage.setItem("sidequest-future-message", futureMessage)
    localStorage.setItem("sidequest-selected-game", selectedGame.trim())
    localStorage.setItem("sidequest-session-start", String(start))
    localStorage.setItem("sidequest-session-end", String(end))
    window.setTimeout(() => setActiveTab("Today"), 450)
  }

  const endSession = () => {
    setSessionEnd(null)
    setSessionStart(null)
    setShowTimeUp(false)
    setShowEndConfirm(false)
    setSessionCompleted(true)
    setPlanSaved(false)
    setActiveTab("Today")
    localStorage.removeItem("sidequest-session-end")
    localStorage.removeItem("sidequest-session-start")
  }

  const extendSession = () => {
    const start = Date.now()
    const end = start + 20 * 60 * 1000
    setPlannedMinutes(20)
    setNow(start)
    setSessionStart(start)
    setSessionEnd(end)
    setShowTimeUp(false)
    setSessionCompleted(false)
    setActiveTab("Today")
    localStorage.setItem("sidequest-session-start", String(start))
    localStorage.setItem("sidequest-session-end", String(end))
  }

  const continueWithoutReminder = () => {
    setShowTimeUp(false)
    setSessionCompleted(true)
    setPlanSaved(false)
    setSessionStart(null)
    setActiveTab("Today")
    localStorage.removeItem("sidequest-session-start")
  }

  const saveProfileDetails = () => {
    localStorage.setItem("sidequest-profile-name", profileName)
    localStorage.setItem("sidequest-profile-goal", profileGoal)
    setProfileDetailsSaved(true)
    window.setTimeout(() => setProfileDetailsSaved(false), 1600)
  }

  const initials =
    profileName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ME"

  return (
    <div className="app">
      <header className="topbar">
        <Logo />
        <nav className="desktop-nav" aria-label="Main navigation">
          {["Today", "Plan", "Questions", "Insights"].map((tab) => (
            <button
              className={`${activeTab === tab ? "nav-item active" : "nav-item"} ${tab === "Plan" && sessionEnd ? "locked" : ""}`}
              disabled={
                (!profileSaved && tab !== "Questions") ||
                (tab === "Plan" && Boolean(sessionEnd))
              }
              key={tab}
              onClick={() => setActiveTab(tab)}
              title={
                !profileSaved && tab !== "Questions"
                  ? "Complete setup questions first"
                  : tab === "Plan" && sessionEnd
                  ? "Your plan is locked during an active session"
                  : undefined
              }
              type="button"
            >
              {tab === "Plan" && sessionEnd ? "Plan locked" : tab}
            </button>
          ))}
        </nav>
        <div className="top-actions">
          <button
            className="icon-button"
            aria-label="Open settings"
            onClick={() => setShowPreferences(true)}
            type="button"
          >
            <Icon name="settings" />
          </button>
          <button
            className="avatar"
            aria-label="Open profile"
            onClick={() => setActiveTab("Profile")}
            type="button"
          >
            {initials}
          </button>
        </div>
      </header>

      {activeTab === "Today" && (
        sessionEnd ? (
          <main className="active-session-page">
            <div className="focus-status">
              <span className="focus-pulse" />
              Focus Session Active
            </div>
            <div className="active-game">
              <span>Now playing</span>
              <strong>{selectedGame}</strong>
            </div>
            <div className="focus-timer" aria-label={`${remainingMinutes} minutes and ${remainingSecondsPart} seconds remaining`}>
              {remainingHours > 0 && (
                <>
                  <span>{String(remainingHours).padStart(2, "0")}</span>
                  <small>:</small>
                </>
              )}
              <span>{String(remainingMinutes).padStart(2, "0")}</span>
              <small>:</small>
              <span>{String(remainingSecondsPart).padStart(2, "0")}</span>
            </div>
            <p className="timer-caption">
              {remainingHours > 0 ? "hours · minutes · seconds" : "minutes · seconds"}
            </p>
            <div className="focus-progress">
              <span style={{ width: `${timerProgress}%` }} />
            </div>
            <div className="focus-meta">
              <span><Icon name="clock" /> Started {startLabel}</span>
              <span><Icon name="game" /> {plannedMinutes} minute plan</span>
              <span><Icon name="settings" /> Plan locked</span>
            </div>
            <div className="focus-note">
              <Icon name="moon" />
              <div>
                <span>Your reason for stopping</span>
                <p>“{futureMessage}”</p>
              </div>
            </div>
            <p className="focus-guidance">
              Your plan is locked so you can stay focused. You can end the session early,
              but the timer can’t be restarted or changed while it’s active.
            </p>
            <button className="end-session-button" onClick={() => setShowEndConfirm(true)} type="button">
              End session early
            </button>
          </main>
        ) : (
        <main className="dashboard">
          <section className="session-panel">
            <div className="session-title">
              <span className={sessionEnd ? "live-dot" : "live-dot idle"} />
              <span>{sessionCompleted ? "Session complete" : "No active session"}</span>
            </div>
            <div className="session-time">
              {sessionEnd ? (
                remainingHours > 0 ? (
                  <>
                    <span>{remainingHours}</span>
                    <small>h</small>
                    <span>{String(remainingMinutes).padStart(2, "0")}</span>
                    <small>m</small>
                  </>
                ) : (
                  <>
                    <span>{remainingMinutes}</span>
                    <small>m</small>
                    <span>{String(remainingSecondsPart).padStart(2, "0")}</span>
                    <small>s</small>
                  </>
                )
              ) : (
                <>
                  <span>0</span>
                  <small>h</small>
                  <span>00</span>
                  <small>m</small>
                </>
              )}
            </div>
            <div className="time-track">
              <div
                className="time-fill"
                style={{ width: `${timerProgress}%` }}
              />
              {sessionEnd && <span className="goal-pin" />}
            </div>
            <div className="time-legend">
              <span>Started at {startLabel}</span>
              <span>
                Goal: {Math.floor(plannedMinutes / 60)}h{" "}
                {plannedMinutes % 60 || ""}m
              </span>
            </div>
            <div className="future-note">
              <div className="note-icon">
                <Icon name="moon" />
              </div>
              <div>
                <span>A note from past you</span>
                <p>“{futureMessage}”</p>
              </div>
            </div>
            <p className="gentle-copy">
              {sessionCompleted
                ? `Your ${selectedGame || "gaming"} session is finished. Take a moment before deciding what comes next.`
                : "Set a session plan before you play, and we’ll keep track for you."}
            </p>
            {!sessionEnd && (
              <button
                className="start-plan-button"
                onClick={() => setActiveTab("Plan")}
                type="button"
              >
                Plan a session <Icon name="arrow" />
              </button>
            )}
          </section>

          <section className="recommendation-area">
            <div className="recommendation-heading">
              <div>
                <span className="kicker">
                  <Icon name="spark" /> {contextLabel}
                </span>
                <h1>
                  {isLate
                    ? "Let’s land the night gently."
                    : "Ready for a side quest?"}
                </h1>
                <p>Based on your time, interests, and what’s nearby.</p>
                <div className="context-status">
                  <span>
                    <Icon name="clock" />{" "}
                    {new Date(now).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  <span
                    className={
                      locationStatus === "granted" ? "location-on" : ""
                    }
                  >
                    <Icon name="walk" />{" "}
                    {locationStatus === "granted"
                      ? "Location on"
                      : "At-home suggestions"}
                  </span>
                </div>
              </div>
              <div className="recommendation-actions">
                <button
                  className="fresh-ideas-button"
                  disabled={generatingIdeas}
                  onClick={generateRecommendations}
                  type="button"
                >
                  <Icon name="spark" />
                  {generatingIdeas ? "Finding ideas…" : "Get fresh ideas"}
                </button>
                <button
                  className="tune-button"
                  onClick={() => setShowPreferences(true)}
                  type="button"
                >
                  <Icon name="settings" /> Tune suggestions
                </button>
              </div>
            </div>
            {recommendationError && (
              <div className="recommendation-error" role="status">
                {recommendationError} Your built-in suggestions are still
                available.
              </div>
            )}

            <div className={`card-stage ${loading ? "is-loading" : ""}`}>
              <div className="stack-card stack-two" />
              <div className="stack-card stack-one" />
              {loading ? (
                <div className="loading-card">
                  <div className="loader-orbit">
                    <Icon name="spark" />
                  </div>
                  <strong>Learning your rhythm…</strong>
                  <p>Using your feedback to find a better fit.</p>
                  <div className="loading-track">
                    <span />
                  </div>
                </div>
              ) : (
                <article className="activity-card">
                  <div className="activity-image">
                    <img
                      alt=""
                      src={card.image}
                      style={{ objectPosition: card.imagePosition || "center" }}
                    />
                    <span className="context-pill">
                      <Icon name="spark" /> {card.context}
                    </span>
                    <span className="card-count">
                      {(cardIndex % eligibleRecommendations.length) + 1} /{" "}
                      {eligibleRecommendations.length}
                    </span>
                  </div>
                  <div className="activity-content">
                    <div className="activity-tags">
                      {card.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <h2>{card.title}</h2>
                    <p>{card.description}</p>
                    <div className="activity-meta">
                      <span>
                        <Icon name="clock" /> {card.duration}
                      </span>
                      <span>
                        <Icon name="walk" /> {card.distance}
                      </span>
                    </div>
                  </div>
                </article>
              )}
            </div>

            <div className="swipe-actions">
              <button
                className="swipe-button dislike"
                disabled={loading}
                onClick={() => respond("passed")}
                type="button"
              >
                <Icon name="close" />
                <span>Not for me</span>
              </button>
              <button
                className="swipe-button like"
                disabled={loading}
                onClick={() => respond("liked")}
                type="button"
              >
                <Icon name="check" />
                <span>I’m interested</span>
              </button>
            </div>
            <p className="learning-note">
              <Icon name="spark" /> Every choice helps Sidequest understand what
              works for you.
            </p>
          </section>
        </main>
        )
      )}

      {activeTab === "Plan" && (
        <main className="page-view">
          <div className="flow-steps" aria-label="Setup progress">
            <span className="complete"><Icon name="check" /> Questions</span>
            <span className="active">2 Plan</span>
            <span>3 Session</span>
          </div>
          <div className="page-intro">
            <span className="kicker">
              <Icon name="game" /> Before you queue
            </span>
            <h1>Make a plan your future self can keep.</h1>
            <p>
              Choose a stopping point while your head is clear. We’ll check in
              without nagging.
            </p>
          </div>
          <section className="plan-card">
            <div className="form-block">
              <label htmlFor="game-name">What game are you playing?</label>
              <p>Your game will stay visible throughout this focus session.</p>
              <div className="game-input-wrap">
                <Icon name="game" />
                <input
                  autoComplete="off"
                  id="game-name"
                  onChange={(event) => setSelectedGame(event.target.value)}
                  placeholder="e.g. Valorant, Fortnite, Stardew Valley"
                  value={selectedGame}
                />
              </div>
            </div>
            <div className="form-block">
              <label htmlFor="time-goal">How long do you want to play?</label>
              <p>A realistic goal is more useful than a perfect one.</p>
              <div className="time-options">
                {[2, 5, 30, 60, 90, 120].map((minutes) => (
                  <button
                    className={plannedMinutes === minutes ? "selected" : ""}
                    key={minutes}
                    onClick={() => setPlannedMinutes(minutes)}
                    type="button"
                  >
                    {minutes < 60
                      ? `${minutes} min`
                      : `${minutes / 60} hr${minutes > 60 ? "s" : ""}`}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-block">
              <label htmlFor="future-message">Write a note to future you</label>
              <p>
                We’ll show this when you reach your limit—in your own words.
              </p>
              <textarea
                id="future-message"
                onChange={(event) => setFutureMessage(event.target.value)}
                value={futureMessage}
              />
            </div>
            <div className="checkin-row">
              <div>
                <strong>Keep checking in</strong>
                <p>
                  {followUpReminders
                    ? "If I keep playing, remind me again every 20 minutes."
                    : "Do not send another reminder after my time is up."}
                </p>
              </div>
              <button
                className={followUpReminders ? "toggle on" : "toggle"}
                aria-label={
                  followUpReminders
                    ? "Disable follow-up reminders"
                    : "Enable follow-up reminders"
                }
                aria-pressed={followUpReminders}
                onClick={() => setFollowUpReminders((value) => !value)}
                type="button"
              >
                <span />
              </button>
            </div>
            <button
              className="primary-button"
              disabled={!selectedGame.trim() || Boolean(sessionEnd)}
              onClick={savePlan}
              type="button"
            >
              {planSaved ? (
                <>
                  <Icon name="check" /> Plan saved
                </>
              ) : (
                <>
                  Set my session plan <Icon name="arrow" />
                </>
              )}
            </button>
          </section>
        </main>
      )}

      {activeTab === "Insights" && (
        <main className="page-view">
          <div className="page-intro insights-intro">
            <span className="kicker">
              <Icon name="chart" /> Your patterns
            </span>
            <h1>What helps you step away?</h1>
            <p>
              Not screen-time shame—just useful clues from the choices you’ve
              made.
            </p>
          </div>
          <section className="insight-grid">
            <div className="insight-card featured">
              <span className="insight-label">Strongest pattern</span>
              <strong>Social plans make breaks 2× more appealing.</strong>
              <p>
                You tend to choose activities that include a friend or
                community.
              </p>
              <div className="mini-chart">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className="insight-card">
              <span className="insight-label">Your feedback</span>
              <strong>
                {likedCount} saved idea{likedCount === 1 ? "" : "s"}
              </strong>
              <p>{Object.keys(feedback).length} total recommendations rated</p>
              <button
                className="inline-button"
                onClick={() => setShowAll(!showAll)}
                type="button"
              >
                {showAll ? "Hide history" : "View your history"}{" "}
                <Icon name="arrow" />
              </button>
            </div>
            <div className="insight-card">
              <span className="insight-label">Best interruption</span>
              <strong>A plan with someone else</strong>
              <p>
                Outside accountability works better for you than repeated timers
                alone.
              </p>
            </div>
          </section>
          {showAll && (
            <section className="history-list">
              <h2>Recommendation history</h2>
              {feedbackRows.length ? (
                feedbackRows.map((item) => (
                  <div className="history-row" key={item.id}>
                    <img alt="" src={item.image} />
                    <span>{item.title}</span>
                    <strong className={item.choice}>
                      {item.choice === "liked" ? "Interested" : "Passed"}
                    </strong>
                  </div>
                ))
              ) : (
                <p className="empty-state">
                  Your likes and passes will show up here.
                </p>
              )}
            </section>
          )}
        </main>
      )}

      {activeTab === "Questions" && (
        <main className="page-view questions-page">
          <div className="flow-steps" aria-label="Setup progress">
            <span className="active">1 Questions</span>
            <span>2 Plan</span>
            <span>3 Session</span>
          </div>
          <div className="page-intro">
            <span className="kicker">
              <Icon name="game" /> Your play profile
            </span>
            <h1>Help GameToRealtiy understand your gaming patterns.</h1>
            <p>
              Just six optional questions. Your answers stay on this device and
              help make reminders more useful.
            </p>
          </div>
          <section
            className="questions-card"
            aria-labelledby="profile-question-title"
          >
            <div className="profile-progress-row">
              <span>
                {profileSaved ? "Update your profile" : "Play profile"}
              </span>
              <span>
                {profileQuestion + 1} of {playProfileQuestions.length}
              </span>
            </div>
            <div className="profile-progress-track">
              <span
                style={{
                  width: `${((profileQuestion + 1) / playProfileQuestions.length) * 100}%`,
                }}
              />
            </div>
            <span className="profile-time">
              About {playProfileQuestions.length - profileQuestion} min left
            </span>
            <h2 id="profile-question-title">
              {playProfileQuestions[profileQuestion].title}
            </h2>
            <p>{playProfileQuestions[profileQuestion].helper}</p>
            <textarea
              autoFocus
              onChange={(event) => updateProfileAnswer(event.target.value)}
              placeholder={playProfileQuestions[profileQuestion].placeholder}
              value={profileAnswers[profileQuestion]}
            />
            <div className="profile-controls">
              <button
                className="profile-back"
                disabled={profileQuestion === 0}
                onClick={() =>
                  setProfileQuestion((value) => Math.max(0, value - 1))
                }
                type="button"
              >
                Back
              </button>
              <span>Optional—you can skip any question.</span>
              <button
                className="primary-button"
                onClick={continueProfile}
                type="button"
              >
                {profileQuestion === playProfileQuestions.length - 1
                  ? "Continue to plan"
                  : profileAnswers[profileQuestion].trim()
                    ? "Continue"
                    : "Skip"}
                <Icon
                  name={
                    profileQuestion === playProfileQuestions.length - 1
                      ? "check"
                      : "arrow"
                  }
                />
              </button>
            </div>
          </section>
        </main>
      )}

      {activeTab === "Profile" && (
        <main className="page-view profile-page">
          <section className="profile-hero">
            <div className="profile-avatar">{initials}</div>
            <div>
              <span className="kicker">Your GameToRealtiy profile</span>
              <h1>{profileName || "Your profile"}</h1>
              <p>
                Your information stays on this device and helps tailor your
                reminders and recommendations.
              </p>
            </div>
          </section>

          <div className="profile-layout">
            <section className="profile-main-card">
              <div className="section-heading">
                <div>
                  <span>Personal details</span>
                  <h2>What should we know?</h2>
                </div>
                {profileDetailsSaved && (
                  <span className="saved-badge">
                    <Icon name="check" /> Saved
                  </span>
                )}
              </div>
              <label className="profile-field">
                <span>Name</span>
                <input
                  onChange={(event) => setProfileName(event.target.value)}
                  value={profileName}
                />
              </label>
              <label className="profile-field">
                <span>Your healthier gaming goal</span>
                <textarea
                  onChange={(event) => setProfileGoal(event.target.value)}
                  value={profileGoal}
                />
              </label>
              <button
                className="primary-button"
                onClick={saveProfileDetails}
                type="button"
              >
                Save changes <Icon name="check" />
              </button>
            </section>

            <aside className="profile-summary">
              <section className="profile-summary-card">
                <span className="summary-icon">
                  <Icon name="game" />
                </span>
                <div>
                  <span className="summary-label">Play profile</span>
                  <strong>
                    {answeredProfileQuestions} of {playProfileQuestions.length}{" "}
                    answered
                  </strong>
                </div>
                <button
                  onClick={() => setActiveTab("Questions")}
                  type="button"
                >
                  Update
                </button>
              </section>
              <section className="profile-summary-card">
                <span className="summary-icon">
                  <Icon name="heart" />
                </span>
                <div>
                  <span className="summary-label">Recommendation feedback</span>
                  <strong>{Object.keys(feedback).length} activities rated</strong>
                </div>
                <button onClick={() => setActiveTab("Insights")} type="button">
                  View
                </button>
              </section>
              <section className="profile-summary-card">
                <span className="summary-icon">
                  <Icon name="settings" />
                </span>
                <div>
                  <span className="summary-label">Activity preferences</span>
                  <strong>
                    {activitySetting} · {interests.length} interests
                  </strong>
                </div>
                <button onClick={() => setShowPreferences(true)} type="button">
                  Edit
                </button>
              </section>
              <section className="privacy-card">
                <Icon name="heart" />
                <div>
                  <strong>Private by default</strong>
                  <p>
                    Your profile, answers, and feedback are stored only in this
                    browser.
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </main>
      )}

      {showPreferences && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={() => setShowPreferences(false)}
        >
          <section
            className="preferences-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="preferences-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label="Close preferences"
              onClick={() => setShowPreferences(false)}
              type="button"
            >
              <Icon name="close" />
            </button>
            <span className="kicker">
              <Icon name="settings" /> Personalize
            </span>
            <h2 id="preferences-title">What sounds good to you?</h2>
            <p>
              Pick as many as you like. We’ll use these alongside time, weather,
              and your feedback.
            </p>
            <div className="setting-block">
              <span className="setting-label">
                Where do you like to recharge?
              </span>
              <div className="setting-options">
                {["Indoor", "Outdoor", "Either"].map((setting) => (
                  <button
                    className={activitySetting === setting ? "selected" : ""}
                    key={setting}
                    onClick={() => setActivitySetting(setting)}
                    type="button"
                  >
                    <span>
                      <Icon
                        name={
                          setting === "Indoor"
                            ? "home"
                            : setting === "Outdoor"
                              ? "walk"
                              : "spark"
                        }
                      />
                    </span>
                    {setting}
                  </button>
                ))}
              </div>
            </div>
            <div className="location-preference">
              <div className="location-copy">
                <span className="location-icon">
                  <Icon name="walk" />
                </span>
                <div>
                  <strong>Use my current location</strong>
                  <p>
                    Helps avoid places that are too far away or unavailable.
                    Your coordinates aren’t saved.
                  </p>
                </div>
              </div>
              <button
                className={
                  locationStatus === "granted"
                    ? "location-button enabled"
                    : "location-button"
                }
                disabled={locationStatus === "loading"}
                onClick={requestLocation}
                type="button"
              >
                {locationStatus === "granted" ? (
                  <>
                    <Icon name="check" /> On
                  </>
                ) : locationStatus === "loading" ? (
                  "Locating…"
                ) : locationStatus === "denied" ? (
                  "Try again"
                ) : (
                  "Enable"
                )}
              </button>
            </div>
            <span className="setting-label">What are you interested in?</span>
            <div className="interest-grid">
              {interestOptions.map((interest) => (
                <button
                  className={interests.includes(interest) ? "selected" : ""}
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  type="button"
                >
                  <span>
                    {interests.includes(interest) && <Icon name="check" />}
                  </span>
                  {interest}
                </button>
              ))}
            </div>
            <div className="profile-prompt">
              <div className="profile-prompt-icon">
                <Icon name="game" />
              </div>
              <div>
                <strong>
                  {profileSaved
                    ? "Your play profile is ready"
                    : "Help us understand your play style"}
                </strong>
                <p>
                  Six short questions make your reminders and suggestions more
                  relevant.
                </p>
              </div>
              <button onClick={openPlayProfile} type="button">
                {profileSaved ? "Update" : "Start"}
              </button>
            </div>
            <button
              className="primary-button"
              onClick={() => setShowPreferences(false)}
              type="button"
            >
              Save preferences <Icon name="arrow" />
            </button>
          </section>
        </div>
      )}

      {showTimeUp && (
        <div className="modal-backdrop timer-backdrop">
          <section
            className="time-up-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="time-up-title"
          >
            <div className="time-up-icon">
              <Icon name="clock" />
            </div>
            <span className="kicker">A note from past you</span>
            <h2 id="time-up-title">Your planned time is up.</h2>
            <span className="finished-game"><Icon name="game" /> {selectedGame}</span>
            <blockquote>“{futureMessage}”</blockquote>
            <p>
              You don’t have to decide forever—just whether another game is
              worth it right now.
            </p>
            <div className="time-up-actions">
              <button
                className="primary-button"
                onClick={endSession}
                type="button"
              >
                I’m done for now <Icon name="check" />
              </button>
              <button
                className="secondary-button"
                onClick={
                  followUpReminders
                    ? extendSession
                    : continueWithoutReminder
                }
                type="button"
              >
                {followUpReminders
                  ? "Add 20 minutes"
                  : "Continue without reminders"}
              </button>
            </div>
          </section>
        </div>
      )}

      {showEndConfirm && (
        <div className="modal-backdrop timer-backdrop">
          <section
            className="end-confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="end-confirm-title"
          >
            <div className="time-up-icon">
              <Icon name="game" />
            </div>
            <span className="kicker">End {selectedGame} session?</span>
            <h2 id="end-confirm-title">Are you sure you want to stop early?</h2>
            <p>
              Ending is always allowed, but your current timer and locked plan
              can’t be resumed after this.
            </p>
            <div className="time-up-actions">
              <button
                className="primary-button"
                onClick={() => setShowEndConfirm(false)}
                type="button"
              >
                Keep session running
              </button>
              <button
                className="secondary-button"
                onClick={endSession}
                type="button"
              >
                End session now
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
