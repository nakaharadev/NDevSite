import React, { JSX, useEffect, useRef, useState } from "react"
import { Input } from "./Input";

interface PrincipleContainerProps {
    title: string,
    children: string,
    color: string
}

const ToAppsBtn = (): JSX.Element => {
    const [hover, setHover] = useState(false);

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "150px",
            height: "50px",
            backgroundColor: hover ? "#212223" : "transparent",
            transition: "background-color .2s",
            cursor: "pointer",
            borderRadius: "20px",
            padding: "10px"
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}>
            <p
            style={{
                color: "#fff",
                fontSize: "25pt",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: 0,
                marginRight: "10px",
                padding: 0
            }}>Apps</p>
            <svg style={{ transform: "translateY(5px)" }} width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <line x1="12" y1="20" x2="1" y2="4" stroke="#ccc" stroke-width="2" stroke-linecap="round"/>
                <line x1="12" y1="20" x2="23" y2="4" stroke="#ccc" stroke-width="2" stroke-linecap="round"/>
            </svg>
        </div>
    );
  };

const PrincipleContainer: React.FC<PrincipleContainerProps> = ({ title, children, color }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
    
        const current = containerRef.current;
        const startHeight = 30;
        const endHeight = current.scrollHeight;
        const duration = 200;
        let startTime: number | null = null;
    
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentHeight = isExpanded
                ? startHeight + (endHeight - startHeight) * progress
                : endHeight - (endHeight - startHeight) * progress;
            
            current.style.height = `${currentHeight}px`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
    
        requestAnimationFrame(animate);
    }, [isExpanded]);

    return (
        <div
            ref={containerRef}
            style={{
                cursor: "pointer",
                height: "30px",
                overflow: "hidden",
                marginTop: "20px",
                borderLeft: `1px ${color} solid`,
                paddingLeft: "5px",
                transition: "height 0.2s ease-in-out"
            }}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}>
            <p className="lexend-400" style={{
                color: isExpanded ? "#fff" : "#ccc",
                fontSize: "17pt",
                transition: "color .2s",
                margin: "0",
                padding: "0",
                height: "30px",
            }}>{ title }</p>
            <p className="lexend-400" style={{
                color: "#ccc",
                fontSize: "13pt",
                margin: "0",
                padding: "0",
                paddingLeft: "10px"
            }}>{ children }</p>
        </div>
    )
}

const Email = (): JSX.Element => {
    const [hover, setHover] = useState(false);

    return (
        <p style={{
            color: "#fff",
            fontSize: "15pt",
            margin: 0,
        }}>
            Email: <span style={{
                color: "#ccc",
                cursor: "pointer",
                textDecoration: hover ? "underline" : "none"
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}>
                ru.nakaharadev@gmail.com
            </span>
        </p>
    )
}

const RequestInput = (): JSX.Element => {
    const [hover, setHover] = useState(false);
    const [click, setClick] = useState(false);

    return (
        <>
            <div style={{
                marginBottom: "10px"
            }}>
                <Input hint="Theme"/>
                <Input hint="Email"/>
                <Input hint="Text"/>
            </div>
            <div style={{
                display: "flex",
                justifyContent: "right"
            }}>
                <p style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "17pt",
                    width: "100px",
                    height: "50px",
                    margin: "20px 0 0 0",
                    background: hover || click ? click ? "#00fffa" : "#00807d" : "transparent",
                    borderRadius: "20px",
                    border: "1px #00fffa solid",
                    cursor: "pointer",
                    transition: "background .3s"
                }}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                onMouseDown={() => setClick(true)}
                onMouseUp={() => setClick(false)}>Send</p>
            </div>
        </>
    )
}

export const AboutPage = (): JSX.Element => {
    const principles = [
        <>
            <PrincipleContainer color="#ff00f5" title="Quality">All my applications are made with a variety of situations in mind and are extremely fault-tolerant. I try to create applications without bugs, avoiding simple paths and crutches. Also, all my applications work on both mobile devices and PCs, and also have web versions.</PrincipleContainer>
            <PrincipleContainer color="#A020F0" title="Design">The application designs are tailored to a large audience and include several preset themes, as well as full access to interface customization.</PrincipleContainer>
            <PrincipleContainer color="#00ff00" title="Unique">I don't watch how others do it. You won't find anyone else's ideas in my apps except mine (unless they're some kind of established laws in development). In particular, the applications themselves provide unique functionality that is not found anywhere else.</PrincipleContainer>
            <PrincipleContainer color="#00bfff" title="Details">I care about the details, not the overall look. Smooth animations, well-chosen colors, support for older devices. These, as well as many other details, are very important, in my opinion, and they create an overall pleasant experience using the application.</PrincipleContainer>
        </>
    ]
    return (
        <div style={{
            width: "100vw",
            height: "100vh",
            backgroundColor: "#121212",
            padding: "60px 0 20px 0"
        }}>
            <div style={{
                maxWidth: "1200px",
                width: "100%",
                margin: "0 auto",
                padding: "0 40px",
                display: "flex"
            }}>
                <div style={{
                    height: "calc(100vh - 80px)",
                    width: "100%",
                    display: "flex"
                }}>
                    <div style={{
                        width: "50%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "space-between"
                    }}>
                        <div style={{
                            height: "100%",
                            maxWidth: "400px"
                        }}>
                            <p className="lexend-400" style={{
                                color: "#ccc",
                                backgroundColor: "#212223",
                                fontSize: "13pt",
                                padding: "15px",
                                borderRadius: "15px"
                            }}>
                                Hello everyone. My name is NDev and I write whatever comes to mind. The list of my applications starts with a social network for role players, and ends with the Mirage language for dynamically creating Java objects. Are you interested? Well, then, welcome, I'll try to please you.
                            </p>
                            <div>
                                <p className="lexend-400" style={{
                                    color: "#fff",
                                    fontSize: "21pt",
                                    marginTop: "10px"
                                }}>My principles</p>
                                {principles}
                            </div>
                        </div>
                        <ToAppsBtn/>
                    </div>
                    <div style={{
                        width: "50%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "right"
                    }}>
                        <p style={{
                            color: "#fff",
                            fontSize: "23pt",
                            margin: "0"
                        }}>Contacts</p>
                       <Email/>
                       <p style={{
                            color: "#fff",
                            fontSize: "23pt",
                            margin: "10px 0 0 0"
                        }}>Or fill</p>
                        <RequestInput/>
                    </div>
                </div>
            </div>
        </div>
    )
}