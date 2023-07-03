import { FC, Fragment, useEffect, useState } from "react";

interface PlmLoadingProps {
  children?: React.ReactNode;
  warrperClassName?: string;
  className?: string;
  loading?: boolean;
}

const PlmLoading: FC<PlmLoadingProps> = ({
  children,
  warrperClassName,
  className,
  loading,
}) => {
  const [process, setProcess] = useState<number>(30);
  const simulateProgress = () => {
    let progress = process;
    let speed = 1000; // 初始加载速度，单位是毫秒

    const incrementProgress = () => {
      progress += 1;
      if (progress >= 100) {
        clearInterval(interval);
        return;
      }

      console.log(`加载进度：${progress}%`);
      setProcess(progress);

      // 调整加载速度
      speed += 100; // 增加加载速度的间隔，单位是毫秒
      setTimeout(incrementProgress, speed);
    };

    const interval = setInterval(incrementProgress, speed);
  };

  useEffect(() => {
    if (loading) {
      simulateProgress();
    } else {
    //   setProcess(100);
    }
  }, [loading]);

  return (
    <div className={`h-full w-full opacity-6 ${warrperClassName || ""}`}>
      {children ? children : <></>}
      {loading ? (
        <Fragment>
          {" "}
          <div className={`plm-loading absolute bg-white ${className || ""}`}>
            <div style={{ width: "254px", minHeight: "50px", height: "50px" }}>
              <div
                className="mb-5 text-center text-xs"
                style={{ fontFamily: "PingFang SC, PingFang SC-Medium" }}
              >
                <span className="text-primary">
                  Loading{" "}
                  <span style={{ fontStyle: "italic" }}>{process}%</span>
                </span>
              </div>
              <div className="flex items-center h-3" style={{ gap: "9px" }}>
                <div
                  className="h-3 flex items-center loading-warpper"
                  style={{
                    width: "255px",
                    background: "#dfe9f5",
                    borderRadius: "6px",
                  }}
                >
                  {Array.from({ length: 23/100 * process })
                    .fill({})
                    .map((item, index) => {
                      return (
                        <div
                          key={index}
                          className={`bg-primary h-2.5 w-2.5 loading_square`}
                          style={{
                            opacity: (index + 1) * 0.05,
                          }}
                        ></div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
          <div
            className={`absolute top-0 h-full w-full opacity-60 bg-white`}
          ></div>
        </Fragment>
      ) : (
        <></>
      )}
    </div>
  );
};

export default PlmLoading;
