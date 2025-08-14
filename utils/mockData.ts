import { SustainabilityMetric, MonthlyReport, User, FAQItem } from "@/types";
import { generateId } from "@/lib/utils";

// Mock users
export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@cityx-hospital.com",
    name: "Dr. Silva",
    role: "admin",
    avatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "2",
    email: "sustainability@cityx-hospital.com",
    name: "Maria Santos",
    role: "user",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "3",
    email: "facilities@cityx-hospital.com",
    name: "João Oliveira",
    role: "user",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
];

// Mock sustainability metrics categories
export const sustainabilityCategories = [
  {
    category: "Energy Consumption",
    subcategories: [
      {
        subcategory: "Electricity",
        metrics: ["Total kWh", "Peak Demand", "Renewable %"],
      },
      {
        subcategory: "Natural Gas",
        metrics: ["Total m³", "Heating", "Hot Water"],
      },
      { subcategory: "Fuel", metrics: ["Diesel (Generators)", "Vehicle Fuel"] },
    ],
  },
  {
    category: "Water Usage",
    subcategories: [
      {
        subcategory: "Municipal Water",
        metrics: ["Total Consumption", "Patient Areas", "Administrative"],
      },
      {
        subcategory: "Recycled Water",
        metrics: ["Rainwater Collected", "Greywater Reused"],
      },
    ],
  },
  {
    category: "Waste Management",
    subcategories: [
      {
        subcategory: "Medical Waste",
        metrics: ["Infectious Waste", "Sharps", "Pharmaceutical"],
      },
      {
        subcategory: "General Waste",
        metrics: ["Recyclables", "Organic", "Landfill"],
      },
    ],
  },
  {
    category: "Transportation",
    subcategories: [
      {
        subcategory: "Fleet Vehicles",
        metrics: ["Distance Traveled", "Fuel Consumption", "Emissions"],
      },
      {
        subcategory: "Staff Commuting",
        metrics: ["Public Transport %", "Carpooling %", "Remote Work Days"],
      },
    ],
  },
];

// Generate mock sustainability metrics
export function generateMockMetrics(
  month: number,
  year: number
): SustainabilityMetric[] {
  const metrics: SustainabilityMetric[] = [];

  sustainabilityCategories.forEach((cat) => {
    cat.subcategories.forEach((subcat) => {
      subcat.metrics.forEach((metric) => {
        const baseValue = Math.random() * 1000 + 100;
        const isLocked = Math.random() > 0.7; // 30% chance of being locked

        metrics.push({
          id: generateId(),
          category: cat.category,
          subcategory: subcat.subcategory,
          metric,
          unit: getUnitForMetric(metric),
          value: Math.round(baseValue * 100) / 100,
          target: Math.round(baseValue * 0.9 * 100) / 100, // 10% reduction target
          isLocked,
          lockedBy: isLocked
            ? mockUsers[Math.floor(Math.random() * mockUsers.length)]
            : undefined,
          lockedAt: isLocked
            ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
            : undefined,
          lastUpdated: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ),
          updatedBy: mockUsers[Math.floor(Math.random() * mockUsers.length)],
        });
      });
    });
  });

  return metrics;
}

function getUnitForMetric(metric: string): string {
  const units: Record<string, string> = {
    "Total kWh": "kWh",
    "Peak Demand": "kW",
    "Renewable %": "%",
    "Total m³": "m³",
    Heating: "m³",
    "Hot Water": "m³",
    "Diesel (Generators)": "L",
    "Vehicle Fuel": "L",
    "Total Consumption": "m³",
    "Patient Areas": "m³",
    Administrative: "m³",
    "Rainwater Collected": "m³",
    "Greywater Reused": "m³",
    "Infectious Waste": "kg",
    Sharps: "kg",
    Pharmaceutical: "kg",
    Recyclables: "kg",
    Organic: "kg",
    Landfill: "kg",
    "Distance Traveled": "km",
    "Fuel Consumption": "L",
    Emissions: "kg CO₂",
    "Public Transport %": "%",
    "Carpooling %": "%",
    "Remote Work Days": "days",
  };

  return units[metric] || "units";
}

// Generate mock monthly reports
export function generateMockReports(): MonthlyReport[] {
  const reports: MonthlyReport[] = [];
  const currentDate = new Date();

  // Generate reports for the last 3 months and next month
  for (let i = -2; i <= 1; i++) {
    const reportDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + i,
      1
    );
    const dueDate = new Date(
      reportDate.getFullYear(),
      reportDate.getMonth() + 1,
      15
    ); // Due 15th of next month
    const isCurrentOrFuture = i >= 0;

    reports.push({
      id: generateId(),
      month: reportDate.getMonth() + 1,
      year: reportDate.getFullYear(),
      metrics: generateMockMetrics(
        reportDate.getMonth() + 1,
        reportDate.getFullYear()
      ),
      isCompleted: i < 0, // Past months are completed
      dueDate,
      submittedAt:
        i < 0
          ? new Date(
              dueDate.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000
            )
          : undefined,
      submittedBy: i < 0 ? mockUsers[1] : undefined, // Maria Santos submitted past reports
    });
  }

  return reports.sort(
    (a, b) =>
      new Date(a.year, a.month - 1).getTime() -
      new Date(b.year, b.month - 1).getTime()
  );
}

// Mock FAQ data with multilingual support
export const mockFAQs: FAQItem[] = [
  {
    id: "1",
    category: "Data Entry",
    category_pt: "Entrada de Dados",
    question: "How do I edit a locked sustainability metric?",
    question_pt: "Como posso editar uma métrica de sustentabilidade bloqueada?",
    answer:
      'Only administrators can unlock metrics that have been locked by other users. Contact your system administrator or use the "Notify Team" button to request assistance.',
    answer_pt:
      'Apenas os administradores podem desbloquear métricas que foram bloqueadas por outros utilizadores. Contacte o seu administrador do sistema ou use o botão "Notificar Equipa" para solicitar assistência.',
  },
  {
    id: "2",
    category: "Data Entry",
    category_pt: "Entrada de Dados",
    question: "What happens when I lock a metric?",
    question_pt: "O que acontece quando bloqueio uma métrica?",
    answer:
      "When you lock a metric, other users cannot edit it until you unlock it or an administrator unlocks it. Your name and timestamp will be recorded with the lock.",
    answer_pt:
      "Quando bloqueia uma métrica, outros utilizadores não podem editá-la até que a desbloqueie ou um administrador a desbloqueie. O seu nome e timestamp serão registados com o bloqueio.",
  },
  {
    id: "3",
    category: "Deadlines",
    category_pt: "Prazos",
    question: "When are sustainability reports due?",
    question_pt: "Quando são devidos os relatórios de sustentabilidade?",
    answer:
      "Monthly sustainability reports are due by the 15th of the following month. You will see countdown notifications and alerts if reports are overdue.",
    answer_pt:
      "Os relatórios mensais de sustentabilidade são devidos até ao dia 15 do mês seguinte. Verá notificações de contagem decrescente e alertas se os relatórios estiverem em atraso.",
  },
  {
    id: "4",
    category: "Language",
    category_pt: "Idioma",
    question: "How do I change the language interface?",
    question_pt: "Como posso alterar o idioma da interface?",
    answer:
      "Use the language toggle switch in the top navigation to switch between English and Portuguese (Português).",
    answer_pt:
      "Use o interruptor de idioma na navegação superior para alternar entre Inglês e Português.",
  },
  {
    id: "5",
    category: "Support",
    category_pt: "Suporte",
    question: "Who should I contact for technical issues?",
    question_pt: "Quem devo contactar para problemas técnicos?",
    answer:
      'For technical issues, click the "Notify Team" button to contact Mr. Silva via WhatsApp, or use the help chat in the bottom right corner.',
    answer_pt:
      'Para problemas técnicos, clique no botão "Notificar Equipa" para contactar o Sr. Silva via WhatsApp, ou use o chat de ajuda no canto inferior direito.',
  },
  {
    id: "6",
    category: "Analytics",
    category_pt: "Análises",
    question: "How are CO₂ emissions calculated?",
    question_pt: "Como são calculadas as emissões de CO₂?",
    answer:
      "CO₂ emissions are calculated using standard conversion factors for electricity, fuel, and other resources. The calculator uses the latest environmental factors from certified sources.",
    answer_pt:
      "As emissões de CO₂ são calculadas usando fatores de conversão padrão para eletricidade, combustível e outros recursos. A calculadora usa os fatores ambientais mais recentes de fontes certificadas.",
  },
];
