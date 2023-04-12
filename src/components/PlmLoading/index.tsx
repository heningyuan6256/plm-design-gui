import {FC, Fragment} from "react";

interface PlmLoadingProps {
    children?: React.ReactNode;
    warrperClassName?: string;
    className?: string;
    loading?: boolean;
}

const PlmLoading: FC<PlmLoadingProps> =
    ({
         children,
         warrperClassName,
         className,
         loading,
     }) => {
        return (
            <div className={`h-full w-full opacity-6 ${warrperClassName || ''}`}>
                {children ? children : <></>}
                {loading ? (
                    <Fragment>
                        {" "}
                        <div className={`plm-loading absolute top-0 bg-white ${className}`}>
                            loading...
                        </div>
                        <div className={`absolute top-0 h-full w-full opacity-60 bg-white`}></div>
                    </Fragment>
                ) : (
                    <></>
                )}
            </div>
        );
    };

export default PlmLoading;
