import React from "react";
import styled from "styled-components";

const LoadingWrapper = styled.div`
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  background: rgba(82, 51, 16, 0.4);
  z-index: 999;
  display: ${props => (props.loading ? "block" : "none")};
`;

const BarsContainer = styled.div`
  height: 50px;
  margin: 0 auto;
  left: 0;
  right: 0;
  position: absolute;
  top: 50%;
  transform: translateY(-90%);
  width: 72px;
`;

const Bar = styled.div`
  background: #fff;
  bottom: 1px;
  height: 10px;
  position: absolute;
  width: 6px;
  animation: sound 0ms -800ms linear infinite alternate;
  @keyframes sound {
    0% {
      opacity: 0.35;
      height: 3px;
    }
    100% {
      opacity: 1;
      height: 28px;
    }
  }
  &:nth-child(1) {
    left: 1px;
    animation-duration: 474ms;
  }
  &:nth-child(2) {
    left: 8px;
    animation-duration: 433ms;
  }
  &:nth-child(3) {
    left: 15px;
    animation-duration: 407ms;
  }
  &:nth-child(4) {
    left: 22px;
    animation-duration: 458ms;
  }
  &:nth-child(5) {
    left: 29px;
    animation-duration: 400ms;
  }
  &:nth-child(6) {
    left: 36px;
    animation-duration: 427ms;
  }
  &:nth-child(7) {
    left: 43px;
    animation-duration: 441ms;
  }
  &:nth-child(8) {
    left: 50px;
    animation-duration: 419ms;
  }
  &:nth-child(9) {
    left: 57px;
    animation-duration: 487ms;
  }
  &:nth-child(10) {
    left: 64px;
    animation-duration: 442ms;
  }
`;

const Loading = ({ loading }) => {
  return (
    <LoadingWrapper loading={loading}>
      <BarsContainer>
        {Array(10)
          .fill(1)
          .map((e, i) => (
            <Bar key={i} />
          ))}
        ;
      </BarsContainer>
    </LoadingWrapper>
  );
};

export default Loading;
