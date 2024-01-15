import { ProgressCircle } from "@adobe/react-spectrum";
import { FC, Fragment, useEffect, useState } from "react";

interface PlmLoadingProps {
  children?: React.ReactNode;
  warrperClassName?: string;
  className?: string;
  loading?: boolean;
  loadingText?: string;
  loadingChildren?: any;
}

const PlmLoading: FC<PlmLoadingProps> = ({
  children,
  warrperClassName,
  className,
  loading,
  loadingText,
  loadingChildren,
}) => {
  const [process, setProcess] = useState<number>(30);
  const simulateProgress = () => {
    let progress = process;
    let speed = 1000; // 初始加载速度，单位是毫秒

    // const interval = setInterval(incrementProgress, speed);
  };

  //   useEffect(() => {
  //     if (loading) {
  //       simulateProgress();
  //     } else {
  //     //   setProcess(100);
  //     }
  //   }, [loading]);

  return (
    <div className={`h-full w-full opacity-6 ${warrperClassName || ""}`}>
      {children ? children : <></>}
      {loading ? (
        <Fragment>
          {" "}
          <div className={`plm-loading absolute ${className || ""}`}>
            {loadingChildren || <></>}
          </div>
          {/* <div
            className={`absolute top-0 h-full w-full opacity-0 bg-white`}
          ></div> */}
        </Fragment>
      ) : (
        <></>
      )}
    </div>
  );
};

export default PlmLoading;
