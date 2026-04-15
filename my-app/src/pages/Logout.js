import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authLogout } from '../redux/userRelated/userSlice';
import styled from 'styled-components';

const Logout = () => {
    const currentUser = useSelector(state => state.user.currentUser);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(authLogout());
        navigate('/');
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <LogoutWrapper>
            <LogoutContainer>
                <UserName>{currentUser?.name || "User"}</UserName>
                <LogoutMessage>Are you sure you want to log out?</LogoutMessage>
                <ButtonGroup>
                    <LogoutButtonLogout onClick={handleLogout}>Log Out</LogoutButtonLogout>
                    <LogoutButtonCancel onClick={handleCancel}>Cancel</LogoutButtonCancel>
                </ButtonGroup>
            </LogoutContainer>
        </LogoutWrapper>
    );
};

export default Logout;

const LogoutWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh; /* Adjust based on your layout */
  padding: 20px;
`;

const LogoutContainer = styled.div`
  width: 100%;
  max-width: 400px;
  border-radius: 20px;
  padding: 40px 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #1a1a1a;
`;

const UserName = styled.h1`
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 8px;
  color: #2c3e50;
`;

const LogoutMessage = styled.p`
  margin-bottom: 30px;
  font-size: 16px;
  color: #7f8c8d;
  text-align: center;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;
`;

const LogoutButton = styled.button`
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;

  &:active {
    transform: scale(0.98);
  }
`;

const LogoutButtonLogout = styled(LogoutButton)`
  background-color: #9444ef;
  color: #fff;

  &:hover {
    background-color: #dc2626;
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
  }
`;

const LogoutButtonCancel = styled(LogoutButton)`
  background-color: #f1f5f9;
  color: #475569;

  &:hover {
    background-color: #e2e8f0;
  }
`;