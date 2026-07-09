function RiskAnatomyBar({ breakdown, showLegend = false }) {
    const ms = breakdown?.multiple_senders || 0;
    const rt = breakdown?.rapid_transfer || 0;
    const nd = breakdown?.new_device || 0;
    const total = ms + rt + nd;
    const safeSpace = Math.max(0, 100 - total);

    return (
        <div className="anatomy-wrap">
            <div className="anatomy-track">
                {ms > 0 && (
                    <div
                        className="anatomy-seg seg-red"
                        style={{ width: `${ms}%` }}
                        title={`Multiple Senders: ${ms}`}
                    />
                )}
                {rt > 0 && (
                    <div
                        className="anatomy-seg seg-amber striped"
                        style={{ width: `${rt}%` }}
                        title={`Rapid Transfer: ${rt}`}
                    />
                )}
                {nd > 0 && (
                    <div
                        className="anatomy-seg seg-orange striped-fine"
                        style={{ width: `${nd}%` }}
                        title={`New Device: ${nd}`}
                    />
                )}
                <div className="anatomy-seg seg-safe" style={{ width: `${safeSpace}%` }} />
            </div>

            {showLegend && (
                <div className="anatomy-legend">
                    <span><i className="dot seg-red" />Multiple senders</span>
                    <span><i className="dot seg-amber" />Rapid transfer</span>
                    <span><i className="dot seg-orange" />New device</span>
                </div>
            )}
        </div>
    );
}

export default RiskAnatomyBar;