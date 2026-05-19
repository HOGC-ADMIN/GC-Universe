import { useEffect } from "react";
import "./index.css";

export default function App() {
  const handleReadMore = (e, url = "https://tracxn.com/") => {
    e.stopPropagation();
    window.open(url, "_blank");
  };

  useEffect(() => {
    const loader = document.getElementById("hogc-loader");
    if (!loader) return;

    const percent = loader.querySelector(".hogc-loader-percent");
    if (!percent) return;

    let progress = 0;
    let cancelled = false;

    const interval = setInterval(() => {
      if (cancelled) return;

      progress += Math.floor(Math.random() * 6) + 2;
      if (progress >= 100) progress = 100;

      percent.textContent = progress + "%";

      if (progress === 100) {
        clearInterval(interval);

        setTimeout(() => {
          if (cancelled) return;
          loader.classList.add("hogc-loader-hide");
        }, 300);
      }
    }, 70);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const planets = [
      "mercury", "venus", "earth", "mars",
      "jupiter", "saturn", "uranus", "neptune", "pluto"
    ];

    let index = 0;
    let lock = false;

    const select = (i) => {
      if (i < 0) i = 0;
      if (i > 8) i = 8;
      index = i;
      document.getElementById(planets[i]).checked = true;
    };

    const wheel = (e) => {
      if (lock) return;
      lock = true;
      e.deltaY > 0 ? select(index + 1) : select(index - 1);
      setTimeout(() => lock = false, 900);
    };

    const key = (e) => {
      if (e.key === "ArrowDown" || e.key === " ") {
        select(index + 1);
        e.preventDefault();
      }
      if (e.key === "ArrowUp") {
        select(index - 1);
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("keydown", key);

    return () => {
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", key);
    };
  }, []);

  return (
    <>
      {/* FIXED LOGO */}
      <div className="hogc-fixed-logo">
        <img src="/Hogc.jpeg" alt="HOGC Logo" />
      </div>

      {/* LOADER */}
      <div id="hogc-loader">
        <div className="hogc-loader-inner">
          <img src="/Hogc.jpeg" alt="HOGC Logo" />
          <span className="hogc-loader-percent">0%</span>
        </div>
      </div>

      {/* RADIO INPUTS */}
      <input className="planet1" type="radio" id="mercury" name="planet" defaultChecked />
      <label className="menu mercury" htmlFor="mercury"><div className="preview" /><div className="info"><h2><span className="pip" />Mercury</h2><h3>0.39 AU</h3></div></label>

      <input className="planet2" type="radio" id="venus" name="planet" />
      <label className="menu venus" htmlFor="venus"><div className="preview" /><div className="info"><h2><span className="pip" />Venus</h2><h3>0.723 AU</h3></div></label>

      <input className="planet3" type="radio" id="earth" name="planet" />
      <label className="menu earth" htmlFor="earth"><div className="preview" /><div className="info"><h2><span className="pip" />Earth</h2><h3>1 AU</h3></div></label>

      <input className="planet4" type="radio" id="mars" name="planet" />
      <label className="menu mars" htmlFor="mars"><div className="preview" /><div className="info"><h2><span className="pip" />Mars</h2><h3>1.524 AU</h3></div></label>

      <input className="planet5" type="radio" id="jupiter" name="planet" />
      <label className="menu jupiter" htmlFor="jupiter"><div className="preview" /><div className="info"><h2><span className="pip" />Jupiter</h2><h3>5.203 AU</h3></div></label>

      <input className="planet6" type="radio" id="saturn" name="planet" />
      <label className="menu saturn" htmlFor="saturn"><div className="preview" /><div className="info"><h2><span className="pip" />Saturn</h2><h3>9.539 AU</h3></div></label>

      <input className="planet7" type="radio" id="uranus" name="planet" />
      <label className="menu uranus" htmlFor="uranus"><div className="preview" /><div className="info"><h2><span className="pip" />Uranus</h2><h3>19.18 AU</h3></div></label>

      <input className="planet8" type="radio" id="neptune" name="planet" />
      <label className="menu neptune" htmlFor="neptune"><div className="preview" /><div className="info"><h2><span className="pip" />Neptune</h2><h3>30.06 AU</h3></div></label>

      <input className="planet9" type="radio" id="pluto" name="planet" />
      <label className="menu pluto" htmlFor="pluto"><div className="preview" /><div className="info"><h2><span className="pip" />Pluto</h2><h3>39.5 AU</h3></div></label>

      {/* SOLAR SYSTEM */}
      <div className="solar">
        {/* Mercury */}
        <div className="solar_systm">
          <div className="planet mercury">
            <div className="planet_description mercury">
              <h2>Planet</h2>
              <h1>HOGC Enterprises</h1>
              <p>Products Designed for Extreme Velocity.</p>
              <button 
                onClick={(e) => handleReadMore(e, "https://tracxn.com/")}
                className="readmore-btn"
                onMouseEnter={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                Read Mor<span>e</span>
              </button>
            </div>
            <div className="overlay" />
          </div>
        </div>

        {/* Venus */}
        <div className="solar_systm">
          <div className="planet venus">
            <div className="planet_description venus">
              <h2>Planet</h2>
              <h1>Autotown</h1>
              <p>Designed for the Art of Driving.</p>
              <button 
                onClick={(e) => handleReadMore(e, "https://tracxn.com/")}
                className="readmore-btn"
                onMouseEnter={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                Read Mor<span>e</span>
              </button>
            </div>
            <div className="overlay" />
          </div>
        </div>

        {/* Earth */}
        <div className="solar_systm">
          <div className="planet earth">
            <div className="planet_description earth">
              <h2>Planet</h2>
              <h1>Platform Architect</h1>
              <p>Built for Real-World Applications.</p>
              <button 
                onClick={(e) => handleReadMore(e, "https://tracxn.com/")}
                className="readmore-btn"
                onMouseEnter={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                Read Mor<span>e</span>
              </button>
            </div>
            <div className="overlay" />
          </div>
        </div>

        {/* Mars */}
        <div className="solar_systm">
          <div className="planet mars">
            <div className="planet_description mars">
              <h2>Planet</h2>
              <h1>Occasio</h1>
              <p>Turn Moments into Movements.</p>
              <button 
                onClick={(e) => handleReadMore(e, "https://tracxn.com/")}
                className="readmore-btn"
                onMouseEnter={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                Read Mor<span>e</span>
              </button>
            </div>
            <div className="overlay" />
          </div>
        </div>

        {/* Jupiter */}
        <div className="solar_systm">
          <div className="planet jupiter">
            <div className="planet_description jupiter">
              <h2>Planet</h2>
              <h1>Client Solutions</h1>
              <p>Architects of Intelligent Growth.</p>
              <button 
                onClick={(e) => handleReadMore(e, "https://tracxn.com/")}
                className="readmore-btn"
                onMouseEnter={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                Read Mor<span>e</span>
              </button>
            </div>
            <div className="overlay" />
          </div>
        </div>

        {/* Saturn */}
        <div className="solar_systm">
          <div className="planet saturn">
            <div className="planet_description saturn">
              <h2>Planet</h2>
              <h1>PropTech Services</h1>
              <p>Where Property Meets Precision.</p>
              <button 
                onClick={(e) => handleReadMore(e, "https://tracxn.com/")}
                className="readmore-btn"
                onMouseEnter={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                Read Mor<span>e</span>
              </button>
            </div>
            <div className="overlay" />
          </div>
        </div>

        {/* Uranus */}
        <div className="solar_systm">
          <div className="planet uranus">
            <div className="planet_description uranus">
              <h2>Planet</h2>
              <h1>GoExplore</h1>
              <p>Redefining How You Travel.</p>
              <button 
                onClick={(e) => handleReadMore(e, "https://tracxn.com/")}
                className="readmore-btn"
                onMouseEnter={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                Read Mor<span>e</span>
              </button>
            </div>
            <div className="overlay" />
          </div>
        </div>

        {/* Neptune */}
        <div className="solar_systm">
          <div className="planet neptune">
            <div className="planet_description neptune">
              <h2>Planet</h2>
              <h1>Startup Lab</h1>
              <p>Born from Vision.</p>
              <button 
                onClick={(e) => handleReadMore(e, "https://tracxn.com/")}
                className="readmore-btn"
                onMouseEnter={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                Read Mor<span>e</span>
              </button>
            </div>
            <div className="overlay" />
          </div>
        </div>

        {/* Pluto */}
        <div className="solar_systm">
          <div className="planet pluto">
            <div className="planet_description pluto">
              <h2>Dwarf Planet</h2>
              <h1>Connect</h1>
              <p>Let's Connect.</p>
              <button 
                onClick={(e) => handleReadMore(e, "https://tracxn.com/")}
                className="readmore-btn"
                onMouseEnter={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                Read Mor<span>e</span>
              </button>
            </div>
            <div className="overlay" />
          </div>
        </div>
      </div>

      <h1 className="logo">
        HOGC Explorer
        <span>All in One Universe</span>
      </h1>
    </>
  );
}