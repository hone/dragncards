import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Tokens } from './Tokens';
import useProfile from "../../hooks/useProfile";
import { CardMouseRegion } from "./CardMouseRegion";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Target } from "./Target";
import { setActiveCardId } from "../store/playerUiSlice";
import { useCardScaleFactor } from "../../hooks/useCardScaleFactor";
import { useGameDefinition } from "./functions/useGameDefinition";
import { useGetDefaultAction } from "./functions/useGetDefaultAction";
import { attachmentOffset, getFirstCardOffset, getVisibleFaceSrc } from "../definitions/common";
import { useGameL10n } from "../../hooks/useGameL10n";

export const Card = React.memo(({
    cardId,
    groupId,
    region,
    offset,
    cardIndex,
    registerDivToArrowsContext,
    isDragging,
}) => { 
    const dispatch = useDispatch();
    const gameDef = useGameDefinition();
    const l10n = useGameL10n();
    const cardCurrentSide = useSelector(state => state?.gameUi?.game?.cardById[cardId]?.currentSide);
    const cardSides = useSelector(state => state?.gameUi?.game?.cardById[cardId]?.sides);
    const cardPeeking = useSelector(state => state?.gameUi?.game?.cardById[cardId]?.peeking);
    const cardTokens = useSelector(state => state?.gameUi?.game?.cardById[cardId]?.tokens);
    const cardRotation = useSelector(state => state?.gameUi?.game?.cardById[cardId]?.rotation);
    const playerN = useSelector(state => state?.playerUi?.playerN);
    const dropdownMenuVisible = useSelector(state => state?.playerUi?.dropdownMenu?.visible);
    const cardScaleFactor = useCardScaleFactor();

    const touchMode = useSelector(state => state?.playerUi?.touchMode);
    if (!cardCurrentSide) return;
    var cardVisibleSide = cardCurrentSide;
    if (cardPeeking[playerN] && cardCurrentSide == "B") cardVisibleSide = "A";
    const currentFace = cardSides[cardCurrentSide];
    const cardVisibleFace = cardSides[cardVisibleSide];
    const visibleFaceSrc = getVisibleFaceSrc(cardVisibleFace, playerN, gameDef);
    const zIndex = 1000 - cardIndex;
    console.log('Rendering Card ',cardVisibleFace.name);
    const isActive = useSelector(state => {return state?.playerUi?.activeCardId === cardId});
    const touchModeSpacingFactor = touchMode ? 1.5 : 1;
    const getDefaultAction = useGetDefaultAction();
    const defaultAction = touchMode && isActive ? getDefaultAction(cardId) : null;
    const defaultPeeking = gameDef?.groups?.[groupId]?.onCardEnter?.peeking?.[playerN];

    const handleMouseLeave = (_event) => {
        console.log("Card mouseleave")
        if (!dropdownMenuVisible) dispatch(setActiveCardId(null))
    }

    var [height, width] = [cardVisibleFace.height, cardVisibleFace.width];
    if (!height || !width) {
        height = gameDef?.cardBacks?.[cardVisibleFace.name]?.height;
        width = gameDef?.cardBacks?.[cardVisibleFace.name]?.width;
    }
    // FIXME: display error if height and width still not defined?

//    const horizontalOffset = getFirstCardOffset(width, cardScaleFactor) + cardScaleFactor*touchModeSpacingFactor/3*offset;
    console.log("Offset", height, width, Math.max(height, width) - Math.min(height, width), cardScaleFactor, touchModeSpacingFactor, offset)
    const horizontalOffset = (Math.max(height, width) - Math.min(height, width))*cardScaleFactor;//*touchModeSpacingFactor/3*(offset+1);
    const destroyed = currentFace.hitPoints > 0 && cardTokens.damage >= currentFace.hitPoints + cardTokens.hitPoints;
    const explored = currentFace.questPoints > 0 && cardTokens.progress >= currentFace.questPoints + cardTokens.hitPoints;

    var className = "";
    if (isActive) className = "shadow-yellow";
    if (destroyed) className = "shadow-red";
    if (explored) className = "shadow-green";
    return (
        <div id={cardId}>
            <div 
                className={className}
                key={cardId}
                style={{
                    position: "absolute",
                    height: `${cardScaleFactor*height}vh`,
                    width: `${cardScaleFactor*width}vh`,
                    left: `${attachmentOffset*cardIndex}vh`,
                    top: "50%",
                    borderRadius: '0.6vh',
                    transform: `translate(0%, -50%) rotate(${cardRotation}deg)`,
                    zIndex: zIndex,
                    cursor: "default",
                    WebkitTransitionDuration: "0.1s",
                    MozTransitionDuration: "0.1s",
                    OTransitionDuration: "0.1s",
                    transitionDuration: "0.1s",
                    WebkitTransitionProperty: "-webkit-transform",
                    MozTransitionProperty: "-moz-transform",
                    OTransitionProperty: "-o-transform",
                    transitionProperty: "transform",
                    MozBoxShadow: isDragging ? '10px 10px 30px 20px rgba(0, 0, 0, 0.3)' : null,
                    WebkitBoxShadow: isDragging ? '10px 10px 30px 20px rgba(0, 0, 0, 0.3)': null,
                    boxShadow: isDragging ? '10px 10px 30px 20px rgba(0, 0, 0, 0.3)': null,
                }}
                onMouseLeave={event => handleMouseLeave(event)}>
                <img className="absolute w-full h-full" style={{borderRadius: '0.6vh'}} src={visibleFaceSrc.src} onError={(e)=>{e.target.onerror = null; e.target.src=visibleFaceSrc.default}} />

                {defaultAction &&
                    <div 
                        className={"absolute w-full pointer-events-none bg-green-700 font-bold rounded text-white text-xs text-center" + (defaultAction.position === "bottom" ? " bottom-0" : "")}
                        style={{height:"40px", opacity: "80%"}}>
                            <div>Tap to</div>
                            {l10n(defaultAction.labelId)}
                    </div>}
                {(cardPeeking[playerN] && !defaultPeeking && !isDragging && (cardCurrentSide === "B")) ? <FontAwesomeIcon className="absolute top-0 right-0 text-2xl" icon={faEye}/>:null}
                <Target
                    cardId={cardId}/>
                <CardMouseRegion 
                    topOrBottom={"top"}
                    cardId={cardId}
                    isActive={isActive}
                    zIndex={zIndex}/>
                <CardMouseRegion 
                    topOrBottom={"bottom"}
                    cardId={cardId}
                    isActive={isActive}
                    zIndex={zIndex}/>
                <Tokens
                    cardName={currentFace.name}
                    cardId={cardId}
                    cardType={cardVisibleFace.type}
                    isActive={isActive}
                    zIndex={zIndex}
                    aspectRatio={width/height}/>
                <ArrowRegion
                    cardId={cardId}
                    registerDivToArrowsContext={registerDivToArrowsContext}/>
            </div>
        </div>
    )
})

const ArrowRegion = React.memo(({
    cardId,
    registerDivToArrowsContext
}) => {  
    const arrows1 = useSelector(state => state?.gameUi?.game?.playerData?.player1?.arrows);
    const arrows2 = useSelector(state => state?.gameUi?.game?.playerData?.player2?.arrows);
    const arrows3 = useSelector(state => state?.gameUi?.game?.playerData?.player3?.arrows);
    const arrows4 = useSelector(state => state?.gameUi?.game?.playerData?.player4?.arrows);
    const allIds = [arrows1, arrows2, arrows3, arrows4].flat(3);
    if (!allIds.includes(cardId)) return null;
    return (
        <div 
            ref={registerDivToArrowsContext? (div) => registerDivToArrowsContext({ id: "arrow-"+cardId, div }) : null} 
            style={{
                position: "absolute",
                width: "1px", 
                height: "1px",
                top: "50%",
                left: "50%",
            }}/>
    )
})