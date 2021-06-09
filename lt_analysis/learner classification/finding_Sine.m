clear all
clc
x = [20:0.0001:40];
y = 2.197*x-34.44;

x0 = [40:0.0001:60];
y0 = 141.32-2.197*(x0);

x1 = [60:0.0001:80];
y1 = 2.197*x1-122.32;

x2 = [80:0.0001:100];
y2 = 229.2-2.197*(x2);

x3 = [100:0.0001:120];
y3 = 2.197*(x3)-210;

x4 = [120:0.0001:140];
y4 = 317.28-2.197*x4;

x1234 = [x1 x2 x3 x4];
y1234 = [y1 y2 y3 y4];

plot(x, y, x0,y0,x1,y1,x2,y2,x3,y3,x4,y4);
x5 = [x x0 x1 x2 x3 x4];
y5 = [y y0 y1 y2 y3 y4];
% 
% x6 = [80:1:120];
% a1 = 729.1;  
% b1 = 0.003016;  
% c1 = 15.39;
% y6 = a1*sin(b1*x6+c1);
%   
% plot(x6,y6)
% 
% x = linspace(20, 2*pi, 140);
% period = 40;
% y = 43.94 * sin(2 * pi * x / period);
% plot(x, y, 'b-', 'LineWidth', 2);
% ylim([0,120]);
% xlim([60 120]);
% xlabel('x', 'FontSize', 20);
% ylabel('y', 'FontSize', 20);
% title('y vs. x', 'FontSize', 20);
% grid on;
%set(gcf, 'Units', 'Normalized', 'OuterPosition', [0, 0.04, 1, 0.96]);