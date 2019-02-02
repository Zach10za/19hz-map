import styled from "styled-components";

export const Button = styled.button`
  background: rgba(226, 120, 0, 1);
  background-color: ${props =>
    props.tile ? "rgba(226,120,0,0.8)" : "rgba(226,120,0,1)"};
  border: none;
  color: #fff;
  padding: 5px 10px;
  margin: 3px;
  vertical-align: middle;
  cursor: pointer;
  width: ${props => (props.tile ? "22vmin" : "auto")};
  height: ${props => (props.tile ? "22vmin" : "auto")};
  display: inline-block;
  font-family: "Lobster", cursive;
  font-size: 1.3rem;
  transition: all 0.2s ease;
  &:hover {
    background-color: ${props =>
      props.tile ? "rgba(226,120,0,1)" : "rgba(226,120,0,1)"};
  }
`;
