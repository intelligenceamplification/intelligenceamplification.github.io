export const sourceLesson = {
    id: "es-u1-l1-identity-origin", level: "A1", unit: 1, lesson: 1, unitTitle: "Foundations", title: "Identity and origin", skill: "subject + ser + de",
    vocabulary: [
      { word: "yo", english: "I", vietnamese: "mình / tôi", note: "Spanish has one neutral first-person singular. Vietnamese chooses a pronoun through relationship and context." },
      { word: "tú", english: "you", vietnamese: "bạn", note: "Tú is informal singular. Like Vietnamese pronouns, it already says something about the relationship." },
      { word: "soy", english: "I am", vietnamese: "mình là / tôi là", note: "Soy is ser shaped for yo. Spanish can omit yo because the verb already carries it." },
      { word: "eres", english: "you are", vietnamese: "bạn là", note: "Eres is ser shaped for tú. Vietnamese là does not change with the person." },
      { word: "de", english: "from / of", vietnamese: "từ / của", note: "A small word that connects origin, belonging, material, and relationship." },
    ],
    recall: { prompt: "What does soy carry?", instruction: "Answer in English. Include the person as well as the verb.", accepted: ["i am", "i'm", "am"], correct: "Yes. Soy carries “I am.”", hint: "soy = I am", rescue: { answer: "I am" } },
    sentence: { target: "Soy de Indiana.", anchor: "I am from Indiana.", bridge: "Mình đến từ Indiana.", note: "The meaning stays stable. Each language reveals a different way of organizing identity and origin." },
    grammar: {
      focus: "Soy", target: { pattern: "soy + de", explanation: "Ser changes into soy for “I.” The pronoun yo is optional because the verb already identifies the speaker." },
      anchor: { pattern: "I + am + from", explanation: "English requires the subject and changes be to am. This familiar pattern makes Spanish conjugation intelligible." },
      bridge: { pattern: "mình + đến từ", explanation: "The verb phrase does not conjugate. Đến từ carries “come from,” while the pronoun reflects relationship and context." },
      insight: "Spanish and English change the verb. Vietnamese keeps the verb stable. Spanish alone can let the conjugated verb stand without the pronoun.",
      deep: [
        { title: "Conjugation", principle: "ser changes with the person", explanation: "Yo soy, tú eres, and él / ella / usted es are forms of one verb. The change is grammatical information, not new vocabulary." },
        { title: "Subject omission", principle: "soy already contains “I”", explanation: "Spanish pronouns are often omitted when the verb ending makes the subject clear. Use yo when contrast or emphasis matters." },
        { title: "Ser, not estar", principle: "origin is treated as identity", explanation: "Spanish uses ser de for where someone is from. Estar describes location or state, but estoy de Indiana does not express origin." },
        { title: "The range of de", principle: "origin, possession, material", explanation: "De can mean “from” or “of.” The relationship is resolved through context." },
      ],
      summary: "English helps you recognize the changing form of “be.” Vietnamese makes the contrast clearer: là stays stable, while Spanish places person directly inside ser.",
    },
    transform: { language: "Spanish", prompt: "I am from Indiana.", bridgeReminder: "English: I + am + from · Vietnamese: mình + đến từ", accepted: ["Soy de Indiana."], answer: "Soy de Indiana.", hint: "Let the conjugated verb lead." },
    mastery: { prompt: "Translate: I am from Indiana.", instruction: "Write the natural Spanish. The subject pronoun may be omitted.", accepted: ["soy de indiana", "yo soy de indiana"], answer: "Soy de Indiana.", hint: "Let soy carry “I am.”" },
    bridgeMastery: { prompt: "Now say it in Vietnamese.", instruction: "Translate “I am from Indiana” naturally.", accepted: ["mình đến từ indiana", "tôi đến từ indiana"], answer: "Mình đến từ Indiana.", hint: "Use mình or tôi, followed by đến từ." },
    completion: "You mapped person, identity, and origin across Spanish, English, and Vietnamese.",
  };
