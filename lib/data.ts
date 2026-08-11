// ─── Portfolio Data (Scaffold) ────────────────────────────────────────────────
// Replace with your real content when ready.

export const hero = {
  name: "Meheret Alemu",
  title: "Backend Engineer",
  subtitle: "Building scalable systems · Exploring ML",
  cta: { label: "View Work", href: "#projects" },
  contact: { label: "Contact", href: "#contact" },
};

export const about = {
  bio: `I'm a backend engineer who thrives at the intersection of distributed systems and machine learning. 
I design APIs that scale, train models that generalise, and write code that doesn't wake me up at 3am.
Currently obsessed with high-throughput data pipelines and efficient inference serving.`,
  terminal: [
    { key: "role", value: "backend_engineer" },
    { key: "focus", value: "distributed_systems · ml_infra" },
    { key: "languages", value: "Go · Python · TypeScript" },
    { key: "status", value: "open_to_work" },
  ],
};

export const skills = {
  Backend: [
    "Go", "Python", "Node.js", "gRPC", "REST APIs",
    "PostgreSQL", "Redis", "Kafka", "Docker", "Kubernetes",
  ],
  "ML & Data": [
    "PyTorch", "scikit-learn", "Pandas", "NumPy",
    "MLflow", "Triton Inference Server", "HuggingFace",
  ],
  "DevOps & Cloud": [
    "AWS", "GCP", "Terraform", "CI/CD", "Prometheus",
    "Grafana", "GitHub Actions",
  ],
};

export type Project = {
  id: string;
  title: string;
  description: string;
  stack: string[];
  github?: string;
  live?: string;
  featured?: boolean;
  scene: 'queue' | 'server' | 'waveform' | 'vault';
};

export const projects: Project[] = [
  {
    id: "project-1",
    title: "DistroQ",
    description:
      "A high-throughput distributed task queue built in Go with exactly-once delivery semantics. Handles 100k+ messages/sec using Kafka and Redis for deduplication.",
    stack: ["Go", "Kafka", "Redis", "PostgreSQL", "Docker"],
    github: "https://github.com",
    live: undefined,
    featured: true,
    scene: "queue",
  },
  {
    id: "project-2",
    title: "InferKit",
    description:
      "A lightweight ML model serving framework that wraps Triton Inference Server with a unified REST/gRPC gateway, autoscaling, and A/B testing support.",
    stack: ["Python", "FastAPI", "Triton", "gRPC", "Kubernetes"],
    github: "https://github.com",
    live: "https://example.com",
    featured: true,
    scene: "server",
  },
  {
    id: "project-3",
    title: "ChronoGraph",
    description:
      "Real-time anomaly detection for time-series metrics using an LSTM-based model served via a streaming pipeline. Integrates directly with Prometheus and Grafana.",
    stack: ["Python", "PyTorch", "Kafka", "Prometheus", "Grafana"],
    github: "https://github.com",
    live: undefined,
    featured: true,
    scene: "waveform",
  },
  {
    id: "project-4",
    title: "VaultSync",
    description:
      "A secrets synchronisation service that propagates Vault secrets to Kubernetes namespaces, AWS Parameter Store, and GCP Secret Manager — with audit logging.",
    stack: ["Go", "Vault", "AWS", "GCP", "Kubernetes"],
    github: "https://github.com",
    live: undefined,
    featured: false,
    scene: "vault",
  },
];

export type Experience = {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  tech: string[];
};

export const experience: Experience[] = [
  {
    id: "exp-1",
    role: "Senior Backend Engineer",
    company: "Acme Corp",
    period: "2023 – Present",
    description:
      "Led the redesign of the core payments microservice, cutting p99 latency from 800ms to 45ms. Built an ML-driven fraud detection pipeline that reduced chargebacks by 34%.",
    tech: ["Go", "Kafka", "PostgreSQL", "Python", "AWS"],
  },
  {
    id: "exp-2",
    role: "Backend Engineer",
    company: "DataBridge",
    period: "2021 – 2023",
    description:
      "Designed and shipped a real-time data ingestion platform processing 5TB/day. Introduced gRPC across internal services and reduced inter-service latency by 60%.",
    tech: ["Python", "gRPC", "Kafka", "Redis", "GCP"],
  },
  {
    id: "exp-3",
    role: "Junior Software Engineer",
    company: "StartupXYZ",
    period: "2019 – 2021",
    description:
      "Built REST APIs for a B2B SaaS platform serving 200+ enterprise clients. Contributed to the ML feature store that powered personalised recommendations.",
    tech: ["Node.js", "PostgreSQL", "Docker", "scikit-learn"],
  },
];

export const contact = {
  email: "your@email.com",
  socials: [
    { label: "GitHub", href: "https://github.com", icon: "github" },
    { label: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
    { label: "Twitter", href: "https://twitter.com", icon: "twitter" },
  ],
};
