import React, { useEffect, useState } from "react";
import { SideBarPhase } from "./SideBarPhase";
import { SideBarNewRound } from "./SideBarNewRound";
import { useGameDefinition } from "./functions/useGameDefinition";
import { useSelector } from "react-redux";

export const SideBar = React.memo(({}) => {
  const gameDef = useGameDefinition();
  const cardById = useSelector(state => state?.gameUi?.game?.cardById);
  const [triggerMap, setTriggerMap] = useState({})
  useEffect(() => {
      const newTriggerMap = {...triggerMap};
      if (cardById) {
          for (const [cardId, card] of Object.entries(cardById)) {
              if (!card.inPlay) continue;
              for (const [stepId, val] of Object.entries(card?.sides?.[card.currentSide]?.triggers)) {
                console.log("newtriggermap 2", newTriggerMap, stepId, val)
                if (val === true) {
                  if (newTriggerMap?.[stepId]) {
                    newTriggerMap[stepId].push(cardId);
                  } else {
                    newTriggerMap[stepId] = [cardId];
                  }
                }
              }
          }
      }
      console.log("newtriggermap", newTriggerMap)
      setTriggerMap(newTriggerMap);
  }, [cardById])

  return(
    <div className="bg-gray-500" style={{width:"6vh", zIndex: 1e6}}>
      <div className="bg-red-300" style={{height:"3vh"}}>
        <SideBarNewRound/>
      </div>
      <div style={{height:"calc(100% - 3vh)"}}>
        {gameDef?.phases?.map((phaseInfo, phaseIndex) => {
          return(<SideBarPhase key={phaseIndex} phaseInfo={phaseInfo} triggerMap={triggerMap}/>)
      })}
      </div>
    </div>
  )
})
