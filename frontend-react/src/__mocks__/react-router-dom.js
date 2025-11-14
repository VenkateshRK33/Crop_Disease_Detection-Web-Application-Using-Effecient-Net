import React from 'react';

const mockNavigate = jest.fn();
const mockLocation = { pathname: '/' };

export const MemoryRouter = ({ children, initialEntries = ['/'] }) => {
  mockLocation.pathname = initialEntries[0];
  return <div>{children}</div>;
};

export const BrowserRouter = ({ children }) => {
  return <div>{children}</div>;
};

export const Link = ({ to, children, onClick, className }) => {
  return (
    <a href={to} onClick={onClick} className={className}>
      {children}
    </a>
  );
};

export const useLocation = () => mockLocation;

export const useNavigate = () => mockNavigate;

export const Routes = ({ children }) => <div>{children}</div>;

export const Route = ({ element }) => element;
