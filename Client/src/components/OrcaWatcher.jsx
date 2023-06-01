import React from "react";
import { useRef, useState, useEffect } from "react";
import Avatar from "../utils/Avatar.png";
import eye7 from "../utils/eye7.png";

const OrcaWatcher = ({ mouseCoords }) => {
  const Orca = useRef();
  const leftEye = useRef();
  const rightEye = useRef();
  const [anchor, setAnchor] = useState({ x: 0, y: 0 });
  const [angleFromOrca, setAngleFromOrca] = useState();

  useEffect(() => {
    leftEye.current.style.transform = `rotate(${90 + angleFromOrca}deg)`;
    rightEye.current.style.transform = `rotate(${90 + angleFromOrca}deg)`;
  }, [angleFromOrca]);
  useEffect(() => {
    const rect = Orca.current.getBoundingClientRect();
    setAnchor({
      x: (rect.left + 500 + rect.width + 20) / 2,
      y: (rect.top + 120 + rect.height + 200) / 2,
    });
    const angleDeg = angle(mouseCoords.x, mouseCoords.y, anchor.x, anchor.y);
    setAngleFromOrca(angleDeg);
  }, [anchor.x, anchor.y, mouseCoords]);

  function angle(cx, cy, ex, ey) {
    const dy = ey - cy;
    const dx = ex - cx;
    const rad = Math.atan2(dy, dx);
    const deg = rad * (180 / Math.PI);
    return deg;
  }

  return (
    <div className="sm:h-32 sm:w-2/5  2xl:w-1/5  flex mb-4 ">
      <div className="w-full opacity-50 rounded-tr-xl"></div>
      <img
        ref={Orca}
        alt="orca logo"
        src={Avatar}
        className="hidden lg:block left-[350px] absolute h-44 w-60 px-8 mx-7 " //visibile only on big screens
      ></img>
      <img
        ref={leftEye}
        alt="left eye ball"
        src={eye7}
        className={`hidden lg:block absolute  rounded-full left-[497px] h-3 w-3  top-[435px] transform rotate-[${
          90 + angleFromOrca
        }deg] `}
      ></img>

      <img
        ref={rightEye}
        alt="right eye ball"
        src={eye7}
        className={`hidden lg:block absolute rounded-full transform rotate-[${
          angleFromOrca + 90
        }deg]   h-3 w-3  left-[518px] top-[435px] `}
      ></img>
    </div>
  );
};

export default OrcaWatcher;
