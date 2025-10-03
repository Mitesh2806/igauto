const TopStatCard = ({ label, value }: { label: string; value: string | number }) => (
    <div className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800 text-center">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-zinc-400">{label}</p>
    </div>
);
export default TopStatCard;