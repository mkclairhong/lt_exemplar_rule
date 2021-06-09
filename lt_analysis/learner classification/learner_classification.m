clear all
clc

%% make sure to exclude participant #52, #60 and #99
subj_x_resp = zeros(1,36);
training_resp = zeros(120,20);
predictions = zeros(120,36);
error_bilinear = zeros(120,36);
error_sin = zeros(120,36);
error_training = zeros(120,20);
sin_output_data = zeros(1,36); 
extrapolation_bilinear_tmp = zeros(120,36);
extrapolation_sin_tmp = zeros(120,36);
extrapolation_error_bilinear = zeros(120,30);
extrapolation_error_sin = zeros(120,30);

n_sub = 120; % # of subjects 
n_trial = 36;

% For input (cue) values less than 100, y = 229.2-2.197x; inputs greater than 100, output values followed the equation y = 2.197x-210
% sine function that has a vertex at 

raw_file = sprintf('201_training_data.txt'); raw_file = importdata(raw_file); 
input_data = raw_file.data(201:236,2)'; % inputs during testing 
output_data = raw_file.data(201:236,3)'; % correct output during testing according to the bilinear function (not a sin function) 
training_data = raw_file.data(181:200,3)'; % correct output for the last training trial (20)
trained_range_input = raw_file.data(1:200,2); % entire training input
trained_range_output = raw_file.data(1:200,3); % entire training output answers
% sine function: y = 420.124*sin(x) + 
%  f(x) =  a1*sin(b1*x+c1) + a2*sin(b2*x+c2) where  
% a1 = 31.79;  
% b1 = 0.006668;  
% c1 = 0.8828;  
% a2 = 17.79;  
% b2 = 0.1556;  
% c2 = -10.85; 
% for i = 1:n_trial
%     sin_output_data(1,i) = a1*sin(b1*input_data(i)+c1) + a2*sin(b2*input_data(i)+c2);
% end

%% alternative sine function
for i = 1:n_trial
    if input_data(i) <= 60
        sin_output_data(1,i) = 141.32-2.197*input_data(i);
    elseif (input_data(i)>60) && (input_data(i)<=80)
        sin_output_data(1,i) = 2.197*input_data(i)-122.32;
    elseif (input_data(i)>80) && (input_data(i)<=100)
        sin_output_data(1,i) = 229.2-2.197*input_data(i);
    elseif (input_data(i)>100) && (input_data(i)<=120)
        sin_output_data(1,i) = 2.197*input_data(i)-210;
    elseif (input_data(i)>120) && (input_data(i)<=140)
        sin_output_data(1,i) = 317.28-2.197*input_data(i);
    elseif (input_data(i)>140)
        sin_output_data(1,i) = 2.197*input_data(i)-297.88;
    end
end 
% zig-zag bilinear function \/ continued /\/\
x0 = (40:.0001:60); x1 = (60:.0001:80); x2 = (80:.0001:100); x3 = (100:.0001:120); x4 = (120:.0001:140); x5 = (140:.001:160);
y0 = 141.32-2.197*(x0); y1 = 2.197*(x1)-122.32; y2 = 229.2-2.197*(x2); y3 = 2.197*(x3)-210; y4 = 317.28-2.197*(x4); y5 = 2.197*(x5)-297.88;
x6 = [x0 x1 x2 x3 x4 x5]; y6 = [y0 y1 y2 y3 y4 y5];
%%

% note that 252, 260 & 299 are supposed to be excluded! 
for i = 1:n_sub
    b = i + 200;
    filename = sprintf('%d_training_data.txt',b);
    a = importdata(filename);
    subj_x_training = a.data(181:200,4)'; %last 20 training trials
    training_resp(i,:) = subj_x_training; 
    subj_x_prediction = a.data(201:236,4)';
    predictions(i,:) = subj_x_prediction;
end

%% Calculate errors according to the bilinear function 

training_MAE = zeros(120,1); 
for i = 1:n_sub
    for j = 1:20 %last 20 trials 
         error_training(i,j) = abs(training_resp(i,j) - training_data(1,j));
         training_MAE(i,:) = mean(error_training(i,:)); 
    end
end

for i = 1:n_sub
    for j = 1:n_trial
        error_bilinear(i,j) = abs(predictions(i,j) - output_data(1,j)); 
        error_sin(i,j) = abs(predictions(i,j) - sin_output_data(1,j));
    end
end

% look for errors for inputs that are outside of the training range 
a = [];
for i = 1:n_sub
    for j = 1:n_trial
        if input_data(1,j) < 80 || input_data(1,j) > 120 % for inputs OUTSIDE of the training range(extrapolation)
            extrapolation_bilinear_tmp(i,j) = error_bilinear(i,j);
            extrapolation_sin_tmp(i,j) = error_sin(i,j);
            interpolation_bilinear_tmp(i,j) = NaN;
            interpolation_sin_tmp(i,j) = NaN;
        else 
            interpolation_bilinear_tmp(i,j) = error_bilinear(i,j); % the interpolation transfer trials 
            interpolation_sin_tmp(i,j) = error_sin(i,j);
            extrapolation_bilinear_tmp(i,j) = NaN;
            extrapolation_sin_tmp(i,j) = NaN;
        end
    end
    b = extrapolation_bilinear_tmp(i,:); 
    s = extrapolation_sin_tmp(i,:);
    b = b(~isnan(b)); %take out all the NaN's 
    s = s(~isnan(s));
    extrapolation_error_bilinear(i,:) = b; 
    extrapolation_bilinear_MAE(i,1) = mean(extrapolation_error_bilinear(i,:));
    extrapolation_error_sin(i,:) = s; 
    extrapolation_sin_MAE(i,1) = mean(extrapolation_error_sin(i,:));
    bb = interpolation_bilinear_tmp(i,:);
    ss = interpolation_sin_tmp(i,:);
    bb = bb(~isnan(bb)); %take out all the NaN's
    ss = ss(~isnan(ss));
    interpolation_error_bilinear(i,:) = bb; 
    interpolation_bilinear_MAE(i,1) = nanmean(interpolation_bilinear_tmp(i,:));
    interpolation_error_sin(i,:) = ss; 
    interpolation_sin_MAE(i,1) = nanmean(interpolation_sin_tmp(i,:));
end

%confidence interval 
CI_bilinear = zeros(120,2);
CI_sin = zeros(120,2);
for i = 1:n_sub
    % CI for bilinear function [CI lower, CI upper]
    b2 = extrapolation_error_bilinear(i,:);
    SEM = std(b2)/sqrt(length(b2));               % Standard Error
    ts = tinv([0.025  0.975],length(b2)-1);      % T-Score
    CI_bilinear(i,:) = mean(b2) + ts*SEM;  
    % CI for sine functino 
    s2 = extrapolation_error_sin(i,:);
    SEM = std(s2)/sqrt(length(s2));               % Standard Error
    ts = tinv([0.025  0.975],length(s2)-1);      % T-Score
    CI_sin(i,:) = mean(s2) + ts*SEM;  
end

%classify learners
learner_type_bilinear = zeros(n_sub,1);
learner_type_sin = zeros(n_sub,1);
learner_type_final = zeros(n_sub,1);

% learner type according to the bilinear function 
for i = 1:n_sub
    if training_MAE(i) > 10
        learner_type_bilinear(i) = 3; %non-learners
    elseif CI_bilinear(i,2) < 34.72 %the UPPER CI falls under 34.72
        learner_type_bilinear(i) = 2; %rule
    else
        learner_type_bilinear(i) = 1; %exemplar
    end
end
%participants who are excluded
learner_type_bilinear(52,1) = NaN;
learner_type_bilinear(60,1) = NaN;
learner_type_bilinear(99,1) = NaN;

% learner type according to the sine function 
for i = 1:n_sub
    if training_MAE(i) > 10
        learner_type_sin(i) = 103; %non-learners
    elseif extrapolation_sin_MAE(i,1) < 10 && CI_sin(i,2) < 24.09 %the MAE < 10 (extrapolation trials) and the UPPER CI falls under 24.09
        learner_type_sin(i) = 102; %sin-rule learners 
    else
        learner_type_sin(i) = 101; %exemplar
    end
end
learner_type_sin(52,1) = NaN;
learner_type_sin(60,1) = NaN;
learner_type_sin(99,1) = NaN;

%compile all the learner types 
for i = 1:n_sub
    if training_MAE(i) >10
        learner_type_final(i) = 3;
    elseif CI_bilinear(i,2) < 34.72 || extrapolation_sin_MAE(i,1) < 10 && CI_sin(i,2) < 24.09
        learner_type_final(i) = 2; % rule learner 
    else
        learner_type_final(i) = 1; % exemplar learner 
    end
end
learner_type_final(52,1) = NaN;
learner_type_final(60,1) = NaN;
learner_type_final(99,1) = NaN;


% actual input, output data points
x_input = input_data;
y_output = output_data;
y_sin_output = sin_output_data;


% bilinear functions
x_linear_low = [50 100]; y_linear_low = 229.2-2.197*(x_linear_low);
x_linear_high = [100 150];y_linear_high = 2.197*(x_linear_high)-210;
x_bilinear = [x_linear_low x_linear_high];
y_bilinear = [y_linear_low y_linear_high];

% sine function
x_sin_func = (50:.0001:150);
a1 = 31.79;  
b1 = 0.006668;  
c1 = 0.8828;  
a2 = 17.79;  
b2 = 0.1556;  
c2 = -10.85; 
y_sin_func = a1*sin(b1*(x_sin_func)+c1) + a2*sin(b2*(x_sin_func)+c2);


%% figures 

figure(1)
p1 = plot(x_input,y_output,'o','LineWidth',2); hold on
p2 = plot(x_bilinear,y_bilinear,'--','LineWidth',2);
p3 = plot(x_input,y_sin_output,'s','LineWidth',2);
p4 = plot(x_sin_func,y_sin_func,'--','LineWidth',2);hold off
lgd = legend({'bilinear output','bilinear function','sine output','sine function'},'FontSize',18);
title('intput-output functions & correct outputs','FontSize',18)

figure(2) %learners classified according to the bilinear function 
subplot(1,3,1)
y_exemplar = predictions(learner_type_bilinear == 1,:);
plot(x_input,y_exemplar,'.',x_bilinear,y_bilinear,'--','LineWidth',2);ylim([0,120]);xlim([50 150]);
%lgd = legend({'individual output'},'FontSize',18);
title('exemplar learners(bilinear)','FontSize',18)

subplot(1,3,2)
y_rule = predictions(learner_type_bilinear == 2,:);
plot(x_input,y_rule,'.',x_bilinear,y_bilinear,'--','LineWidth',2);ylim([0,120]);xlim([50 150]);
%lgd = legend({'individual output'},'FontSize',18);
title('rule learners(bilinear)','FontSize',18)

subplot(1,3,3)
y_non = predictions(learner_type_bilinear == 3,:);
plot(x_input,y_non,'.',x_bilinear,y_bilinear,'--','LineWidth',2);ylim([0,120]);xlim([50 150]);
%lgd = legend({'individual output'},'FontSize',18);
title('non leaners(bilinear)','FontSize',18);
%subtitle('Learners classified according ot the bilinear function');

figure(3) %learners classified final
subplot(1,3,1)
y_exemplar_final = predictions(learner_type_final == 1,:);
plot(x_input,y_exemplar_final,'.',x_sin_func,y_sin_func,'--',x_bilinear,y_bilinear,'--','LineWidth',2);ylim([0,120]);xlim([50 150]);
%lgd = legend({'individual outputs',},'FontSize',18);
title('exemplar learners(final)','FontSize',18)

subplot(1,3,2)
y_rule_final = predictions(learner_type_final == 2,:);
plot(x_input,y_rule_final,'.',x_sin_func,y_sin_func,'--',x_bilinear,y_bilinear,'--','LineWidth',2);ylim([0,120]);xlim([50 150]);
%lgd = legend({'individual outputs',},'FontSize',18);
title('rule learners(final)','FontSize',18)

subplot(1,3,3)
y_non_final = predictions(learner_type_final == 3,:);
plot(x_input,y_non_final,'.',x_sin_func,y_sin_func,'--',x_bilinear,y_bilinear,'--','LineWidth',2);ylim([0,120]);xlim([50 150]);
%lgd = legend({'individual outputs'},'FontSize',18);
title('non leaners(final)','FontSize',18);
%suptitle('Final learner classifications');

figure(4)
y_rule_sin = predictions(learner_type_sin == 102,:);
plot(x_input,y_rule_sin,'o',x_sin_func,y_sin_func,'--','LineWidth',2);ylim([0,120]);xlim([50 150]);
lgd = legend({'subj. #201','subj. #220','subj. #262','subj. #275','subj. #276'},'FontSize',18);
title('sine learners','FontSize',18)

figure(5)
subplot(1,3,1)
y_exemplar_sin_mean = mean(predictions(learner_type_sin==101,:));
y_exemplar_bilinear_mean = mean(predictions(learner_type_bilinear==1,:));
plot(x_input,y_exemplar_sin_mean,'*',x_input,y_exemplar_bilinear_mean,'*',x_sin_func,y_sin_func,'--',x_bilinear,y_bilinear,'--','LineWidth',2);ylim([0,120]);xlim([50 150]);
lgd = legend({'exemplar learners (according to sine func.)','exemplar learners (according to bilinear func.)', 'sine function','bilinear function'},'FontSize',18);
title('exemplar learners final(mean)','FontSize',18)

subplot(1,3,2)
y_rule_sin_mean = mean(predictions(learner_type_sin == 102,:));
y_rule_bilinear_mean = mean(predictions(learner_type_bilinear == 2,:));
plot(x_input,y_rule_sin_mean,'*',x_input,y_rule_bilinear_mean,'*',x_sin_func,y_sin_func,'--',x_bilinear,y_bilinear,'--','LineWidth',2);ylim([0,120]);xlim([50 150]);
lgd = legend({'sine learners mean output','rule-learners mean output', 'sine function','bilinear function'},'FontSize',18);
title('rule learners final (mean)','FontSize',18)

subplot(1,3,3)
y_non_sin_mean = mean(predictions(learner_type_sin==103,:));
y_non_bilinear_mean = mean(predictions(learner_type_bilinear == 3,:));
plot(x_input,y_non_sin_mean,'o',x_input,y_non_bilinear_mean,'o',x_sin_func,y_sin_func,'--',x_bilinear,y_bilinear,'--','LineWidth',2);ylim([0,120]);xlim([50 150]);
title('non learners final(mean)','FontSize',18)

% %% Figure 5 in the manuscript
% figure(6) %rule, exemplar, and sine learners (smooth sine)
% %plot(x_input,y_rule_bilinear_mean,'o',x_input,mean(predictions(learner_type_final == 1,:)),'*',x_input,y_rule_sin_mean,'x',x_bilinear,y_bilinear,'k--',x_sin_func,y_sin_func,'--','LineWidth',2);
% %plot(x_input,y_rule_bilinear_mean,'o',x_input,y_rule_sin_mean,'x',x_input,mean(predictions(learner_type_final == 1,:)),'*',x_bilinear,y_bilinear,'k--',x_sin_func,y_sin_func,'--','LineWidth',2);
% rule = plot(x_input,y_rule_bilinear_mean,'o');
% hold on;
% rule_sine = plot(x_input,y_rule_sin_mean,'o');
% hold on;
% exemplar = plot(x_input,mean(predictions(learner_type_final==1,:)),'o');
% hold on;
% criteria = plot(x_bilinear,y_bilinear,'k--',x_sin_func,y_sin_func,'--','LineWidth',2);
% hold on;
% % x = linspace(80,120);
% % y = linspace(120,120);
% area(linspace(80,120),linspace(120,120),'FaceColor','k','FaceAlpha',.1,'EdgeAlpha',.1); %shaded area 
% hold off
% 
% %style 
% set(rule,'Color','#00BFC4','markersize',5,'MarkerEdgeColor','#00BFC4','MarkerFaceColor','#00BFC4'); 
% set(rule_sine,'Color','#529EFF','markersize',5,'MarkerEdgeColor','#529EFF','MarkerFaceColor','#529EFF'); 
% set(exemplar,'Color','#F8766D','markersize',5,'MarkerEdgeColor','#F8766D','MarkerFaceColor','#F8766D'); 
% set(criteria,'Color','#2F4F4F','markersize',5,'MarkerEdgeColor','#2F4F4F','MarkerFaceColor','#2F4F4F'); 
% 
% lgd = legend({'Rule learners (N = 42)','Rule-sine learners (N = 5)','Exemplar learners (N = 39)','Bilinear function','Sine function','Trained range'},'FontSize',16,'Location','northeastoutside');
% 
% xlabel('Input Level ("Zebon Absorbed")','FontSize',20);
% ylabel('Output Level ("Beros Released")','FontSize',20);
% 
% %title('Figure 5. Learner Classifications','Fontsize',16);
% 
% set(findall(groot,'Type','axes'),'FontName','Times');
% set(findall(groot,'Type','axes'),'FontSize',16);

%% Figure 5 in the manuscript
figure(6) %rule, exemplar, and sine learners (smooth sine)

y_rule_sin_mean = mean(predictions(learner_type_sin == 102,:));
y_rule_bilinear_mean = mean(predictions(learner_type_bilinear == 2,:));

exemplar = plot(x_input,mean(predictions(learner_type_final==1,:)),'d');
hold on;
rule = plot(x_input,y_rule_bilinear_mean,'s');
hold on;
rule_sine = plot(x_input,y_rule_sin_mean,'o');
hold on;
bilinear_func = plot(x_bilinear,y_bilinear,'--','LineWidth',2);
hold on;
sine_func = plot(x_sin_func,y_sin_func,':','LineWidth',1.8);
hold on;
area(linspace(80,120),linspace(120,120),'FaceColor','k','FaceAlpha',.1,'EdgeAlpha',.1); %shaded area 
hold off

%style 
%title('Figure 5. Learner Classifications','Fontsize',16);

xlabel('Input Level ("Zebon Absorbed")','FontSize',20);
ylabel('Output Level ("Beros Released")','FontSize',20);
set(findall(groot,'Type','axes'),'FontName','calibri');
set(findall(groot,'Type','axes'),'FontSize',20);


set(exemplar,'Color','#F8766D','markersize',10,'MarkerEdgeColor','#F8766D','MarkerFaceColor','#F8766D'); 
set(rule,'Color','#00BFC4','markersize',10,'MarkerEdgeColor','#00BFC4','MarkerFaceColor','#00BFC4'); 
set(rule_sine,'Color','#00BFC4','markersize',8,'MarkerEdgeColor','#00BFC4','MarkerFaceColor','#00BFC4'); 
set(bilinear_func,'Color','#2F4F4F','markersize',8,'MarkerEdgeColor','#2F4F4F','MarkerFaceColor','#2F4F4F'); 
set(sine_func,'Color','#556B2F','markersize',8,'MarkerEdgeColor','#556B2F','MarkerFaceColor','#556B2F'); 

% include those spaces {                            } so that it is spaced
% out
lgd = legend({'Exemplar learners (N = 39){                            }','Rule learners (N = 42)','Rule-sine learners (N = 5)','Bilinear function','Sine function','Trained range'},'FontSize',20,'Location','southoutside','NumColumns',2);

% pos=lgd.Position;        % retrieve existing position
% pos(3)=0.5*pos(3);       % increase width value 50% in position 4-vector
% lgd.Position=pos;        % set new position
%

box off;
legend boxoff;


%% scratch
% %% Figure 5 in the manuscript
% figure(6) %rule, exemplar, and sine learners (smooth sine)
% %plot(x_input,y_rule_bilinear_mean,'o',x_input,mean(predictions(learner_type_final == 1,:)),'*',x_input,y_rule_sin_mean,'x',x_bilinear,y_bilinear,'k--',x_sin_func,y_sin_func,'--','LineWidth',2);
% %plot(x_input,y_rule_bilinear_mean,'o',x_input,y_rule_sin_mean,'x',x_input,mean(predictions(learner_type_final == 1,:)),'*',x_bilinear,y_bilinear,'k--',x_sin_func,y_sin_func,'--','LineWidth',2);
% rule = plot(x_input,y_rule_bilinear_mean,'o');
% hold on;
% rule_sine = plot(x_input,y_rule_sin_mean,'o');
% hold on;
% exemplar = plot(x_input,mean(predictions(learner_type_final==1,:)),'o');
% hold on;
% criteria = plot(x_bilinear,y_bilinear,'k--',x_sin_func,y_sin_func,'--','LineWidth',2);
% hold on;
% % x = linspace(80,120);
% % y = linspace(120,120);
% area(linspace(80,120),linspace(120,120),'FaceColor','k','FaceAlpha',.1,'EdgeAlpha',.1); %shaded area 
% hold off
% 
% %style 
% set(rule,'Color','#00BFC4','markersize',5,'MarkerEdgeColor','#00BFC4','MarkerFaceColor','#00BFC4'); 
% set(rule_sine,'Color','#529EFF','markersize',5,'MarkerEdgeColor','#529EFF','MarkerFaceColor','#529EFF'); 
% set(exemplar,'Color','#F8766D','markersize',5,'MarkerEdgeColor','#F8766D','MarkerFaceColor','#F8766D'); 
% set(criteria,'Color','#556B2F','markersize',5,'MarkerEdgeColor','#556B2F','MarkerFaceColor','#556B2F'); 
% 
% lgd = legend({'Rule learners (N = 42)','Rule-sine learners (N = 5)','Exemplar learners (N = 39)','Bilinear function','Sine function','Trained range'},'FontSize',16,'Location','northeastoutside');
% 
% xlabel('Input Level ("Zebon Absorbed")','FontSize',20);
% ylabel('Output Level ("Beros Released")','FontSize',20);
% 
% %title('Figure 5. Learner Classifications','Fontsize',16);
% 
% set(findall(groot,'Type','axes'),'FontName','Times');
% set(findall(groot,'Type','axes'),'FontSize',16);

