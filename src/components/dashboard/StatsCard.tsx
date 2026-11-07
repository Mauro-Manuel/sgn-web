
import type { ReactNode } from "react";

interface StatsCardProps {
    title: string;
    value: string;
    icon: ReactNode;
    variant: "green" | "red" | "dark";
}

export default function StatsCard({
    title,
    value,
    icon,
    variant
}: StatsCardProps) {
    return (
        <article className={`stats-card stats-card--${variant}`}>
            <div className="stats-card-icon">
                {icon}
            </div>

            <strong className="stats-card-value">
                {value}
            </strong>

            <span className="stats-card-title">
                {title}
            </span>
        </article>
    );
}
