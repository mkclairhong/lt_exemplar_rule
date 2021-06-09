# Function Learning program ported to Python and developed July, 2009 in the Memory and Complex Learning Laboratory
# at Washington University in St Louis
# email Chris at ckudelka@gmail.com

##notes##
# requires pygame for python 3.1 to be installed
##Changelog##
# 2-26-2010:
	# - fixed issue with Transfer trial order
# 9-2-2010:
	# - minor commenting changes
	# - added 'main' function and __name__ check for runtime
#########


import os, sys
import datetime
import pygame
from pygame.locals import *
if not pygame.font: print('Warning, fonts disabled')


PATH = 'FLpy Data' # where data is stored (folder created if it doesn't exist)
MAX_OUTPUT_VALUE = 200 #set this to what you want the highest possible prediction to be
JUMP_VALUE = 10
ISI = 4000 # interstimulus interval which determines for how long the feedback is displayed
VERTEX = 100 # x value that returns the lowest/highest output value
TICK_INTERVAL = 10
INPUT_BAR_COLOR = (50,0,200)
PREDICTION_BAR_COLOR = (244, 0, 0)
FUNCTION1 = lambda x: 230-2.2*x # function where input < vertex
FUNCTION2 = lambda x: 2.2*x - 210 # function where input > vertex

BLOCK0 = [0]
BLOCK1 = [107]
BLOCK2 = [81]
#BLOCK3 = [101]
#BLOCK4 = [83]
#BLOCK5 = [107]
#BLOCK6 = [93]
#BLOCK7 = [111]
#BLOCK8 = [103]
#BLOCK9 = [91]
#BLOCK10 = [107]

SAMPLE_BLOCK = [BLOCK0]
TRAINING_BLOCKS = [BLOCK1, BLOCK2] #BLOCK3, BLOCK4, BLOCK5, BLOCK6, BLOCK7, BLOCK8, BLOCK9, BLOCK10]

#36 num transfer:
TRANSFER_BLOCK = [[53,79,137]]



PAGE1 = '''
You have just been hired by the National Aeronautics and Space
Administration (NASA), and you were given clearance to be told
some Top Secret information.  Scientists have made some amazing
discoveries on Mars.  Two completely new elements and one odd
organism have been found.

The organism exists on the surface of Mars, and it ABSORBS the
newly discovered element ZEBON.  It RELEASES the newly      
discovered element BEROS.

If you have any questions, ask the experimenter now

If not press ENTER to continue'''.split('\n')

PAGE2 = '''
Scientists have already figured out that the release of Beros is
related to the absorption of Zebon, but they don't know how.

Your job at NASA is to view computer read-outs and figure out
how the absorption of Zebon and the release of Beros are related.

If you have any questions, ask the experimenter now.

Press ENTER to continue.'''.split('\n')

PAGE3 = '''
Two bar graphs will be shown on the screen. The first bar graph
will display the amount of Zebon absorbed. From this, you are to
predict the amount of Beros released on the second bar graph.

In order to make your prediction, use the ARROW KEYS on
the right hand side of the keyboard. Press the UP and DOWN ARROW
KEYS to get yourself in the ballpark of your prediction, then use
the RIGHT and LEFT ARROW KEYS to fine tune your prediction.
(Don't worry....this will be clear once you get started).

If you have any questions, ask the experimenter now.
Press ENTER to move on.'''.split('\n')

PAGE4 = '''
Once you have finished making your prediction, you will be
given feedback. You will be told how far off you were
with your prediction.

It is important to pay attention
to the feedback to learn the amount of Beros produced
by various amounts of the element.

Press ENTER for the Sample Screen.'''.split('\n')

PAGE5 = '''You will now be given a series of test trials.
The purpose of these test trials is to see how much you
have learned so far so please BE AS ACCURATE AS POSSIBLE
Press ENTER to continue.'''.split('\n')

PAGE6 = '''SAMPLE TRIAL: 

Use the arrow keys to change the number,
then press ENTER when you have made
your prediction.

In order to move on,
make a prediction of:    132

Note:
UP/DOWN moves by {0}.
LEFT/RIGHT moves by 1.'''.format(JUMP_VALUE).split('\n')

PAGE7 = '''Good Job!.
Remember to use all 4 arrow keys and to
BE AS ACCURATE AS POSSIBLE!

If you have any questions, ask your experimenter now.

Press ENTER when you are ready to begin.'''.split('\n')

PAGE8 = '''Press ENTER when you have
made your prediction'''.split('\n')

QUIT_PROMPT = '''Are you sure you want to quit?
If yes, press Q.
If not, press ESCAPE or ENTER to resume'''.split('\n')

TRAINING_INSTRUCTIONS = [PAGE1, PAGE2, PAGE3, PAGE4]
SAMPLE_INSTRUCTIONS1 = PAGE6
SAMPLE_INSTRUCTIONS2 = [PAGE7]
TRIAL_INSTRUCTIONS = PAGE8
TEST_INSTRUCTIONS = [PAGE5]

### program and graphics classes and functions ###
class Bar():

    def __init__(self, x=0, y=0, width=0, height=0,
                 frame_color=(100,100,100), bar_color=(255,255,255), label='',
                 tick_interval=5, tick_color=(255,255,255), tick_text_size=10):

        #frame properties
        self.frame_width = width
        self.frame_height = height
        self.frame_x = x
        self.frame_y = y
        self.frame_color = frame_color
        self.frame_rect = pygame.Rect(self.frame_x, self.frame_y, self.frame_width, -self.frame_height)
        #frame tick/labels properties
        self.tick_interval = tick_interval
        self.tick_color = tick_color
        self.tick_text_size = tick_text_size
        self.tick_y = self.frame_y - 1
        self.tick_text_y = self.tick_y - tick_text_size/2
        #label and its properties
        #label must be a list
        self.label = TextDisplay(label, font_size=2*self.tick_text_size, color=self.tick_color)
                
        #bar properties
        self.bar_width = 0.9 * self.frame_width
        self.bar_height = 0
        self.bar_x = int(self.frame_x + (self.frame_width - self.bar_width) / 2)
        self.bar_y = self.frame_y
        self.bar_color = bar_color
        self.bar_rect = pygame.Rect(self.bar_x, self.bar_y, self.bar_width, -self.bar_height)
        self.bar_text = TextDisplay('', font_size=16, color=(0,0,0))
    
    def draw(self):
        #draw the ticks of the frame
        for tick_number in range(0, 1+MAX_OUTPUT_VALUE, self.tick_interval):
            tick_text = str(tick_number)
            tick_width = int(self.frame_width/10)
            self.tick_text = TextDisplay([tick_text], font_size=self.tick_text_size, color=self.tick_color)
            #draw numbers next to ticks at increments of 10
            if tick_number % TICK_INTERVAL:
                tick_width = int(tick_width / 2)
                self.tick_text = ''                          
            pygame.draw.line(screen, self.tick_color, (self.frame_x, self.tick_y),
                             (self.frame_x-2*tick_width, self.tick_y))            
            if self.tick_text:
                self.tick_text.draw(x=self.frame_x - 4*tick_width, y=self.tick_text_y)
            self.tick_text_y -= self.tick_interval*self.frame_height/MAX_OUTPUT_VALUE
            self.tick_y -= self.tick_interval*self.frame_height/MAX_OUTPUT_VALUE
        #draw the frame
        pygame.draw.rect(screen, self.frame_color, self.frame_rect)
        #draw the bar label underneath the frame
        self.label.draw(x=self.frame_x, y=self.frame_y+self.label.font_size/2)
        #draw the bar inside the frame    
        pygame.draw.rect(screen, self.bar_color, self.bar_rect)
        #update the display containing bar, frame, and ticks

    def update(self, prediction_value, status_text=''):
        # draws a new bar based on the passed prediction value as well as text
        # inside the bar-frame to show the actual value
        self.bar_text.lines_of_text = [str(prediction_value)]
        #scale the incremented amount to the bar and the ticks
        self.bar_height = int(prediction_value*(self.frame_height/MAX_OUTPUT_VALUE))
        self.bar_rect = pygame.Rect(self.bar_x, self.bar_y, self.bar_width, -self.bar_height)
        pygame.draw.rect(screen, self.frame_color, self.frame_rect)
        pygame.draw.rect(screen, self.bar_color, self.bar_rect)
        #self.bar_text.draw(x=self.frame_x+self.frame_width/3, y=3*self.frame_height/4)
        #display everything on the screen
        pygame.display.update((self.frame_x, self.frame_y-self.frame_height, self.frame_x+self.frame_width, self.frame_y))
        
class TextDisplay():

    def __init__(self, lines_of_text, font="Arial",
                 font_size=16, bold=True, color=(255,255,255), antialias=1):
        self.lines_of_text = lines_of_text
        self.font = font
        self.font_size = font_size
        self.bold = bold
        self.color = color
        self.antialias = antialias
        self.font = pygame.font.SysFont(self.font, self.font_size, self.bold)
        
    def draw(self, x=0, y=0):
        self.x = x
        self.y = y
        line_y = y
        for line in self.lines_of_text:
            self.height = 0
            # render text to a surface then display (blit) it on the monitor/screen
            rendered_text = self.font.render(line, self.antialias, self.color) 
            screen.blit(rendered_text, (self.x, line_y))
            self.height += self.font_size + int(self.font_size/4)
            line_y += self.height

## program functions ##
			
def display_instructions(instructions_list, x=None, y=None):
    if not x:
        x=screen.get_width()/8
        y=screen.get_height()/4
    instruction = TextDisplay('')
    for page in instructions_list:
        # clear the screen
        screen.fill((0,0,0))
        # each page is a list of lines of instruction
        instruction.lines_of_text = page
        instruction.draw(x, y)
        pygame.display.flip()
        # wait for user to press enter/return before moving on
        finished = False
        while not finished:
            response = get_response()
            if response == 'ENTER': finished = True

def display_feedback(trial_data_type, output_value, prediction_value, error_value):
    # displays either feedback or 'next trial' information at the top of the screen after each trial
    accuracy = 100 - (error_value**2)
    if accuracy < 0:
        accuracy = 0
    accuracy_feedback = ''
    if accuracy == 100: accuracy_feedback = 'Perfect!'
    elif 90 < accuracy < 100: accuracy_feedback = 'Great Job!'
    elif 70 < accuracy < 90: accuracy_feedback = 'Good Job!'
    elif 0 <= accuracy < 70: accuracy_feedback = 'Not bad.'
    
    text='Your prediction was {0} units off.; ;        {1}'.format(int(error_value), accuracy_feedback).split(';')
    if trial_data_type == 'Transfer':
        text = ['Get ready for the next trial...']
    rect = (9*screen.get_width()/16, screen.get_height()/3, 13*screen.get_width()/16, screen.get_height())
    screen.fill((0,0,0), rect)
    feedback = TextDisplay(text)
    feedback.draw(x=rect[0], y=rect[1])
    pygame.display.update(rect)
    pygame.time.wait(ISI)

def display_end_of_block(trial_data_type, block_number, number_of_blocks, error, accuracy):
    if trial_data_type != 'Sample':
        text = 'For the trials you just finished,;you were off by an average of {0};Your average accuracy score was {1}; ;Press ENTER to continue.'.format(
            error, accuracy).split(';')
        if block_number == 3 or block_number == 7:
            text.insert(2,'You have just completed {0}% of this experiment.'.format(block_number*number_of_blocks))
    else: return
    pause = TextDisplay(text)
    screen.fill((0,0,0))
    pause.draw(screen.get_width()/4, screen.get_height()/3)
    pygame.display.flip()
    finished = False
    while not finished:
        response = get_response()
        if response == 'ENTER': finished = True

def display_end_of_experiment():
    text = 'This portion of the experiment is now over;Please get the experimenter; ;Press ENTER to close the program..'.split(';')
    end_screen = TextDisplay(text)
    screen.fill((0,0,0))
    end_screen.draw(screen.get_width()/5, screen.get_height()/3)
    pygame.display.flip()
    finished = False
    while not finished:
        response = get_response()
        if response == 'ENTER': finished = True

def get_response():
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()
        elif event.type == KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                quit_prompt()
            elif event.key == pygame.K_RETURN or event.key == pygame.K_KP_ENTER:
                return 'ENTER'

def quit_prompt():
    prompt = TextDisplay(QUIT_PROMPT, color=(255,100,100))
    prompt_rect = (9*screen.get_width()/16, screen.get_height()/12, 13*screen.get_width()/16, screen.get_height()/6)
    prompt.draw(prompt_rect[0], prompt_rect[1])
    pygame.display.update(prompt_rect)
    while True:        
        for event in pygame.event.get():
            if event.type == KEYDOWN:
                if event.key == pygame.K_q:
                    pygame.quit()
                    sys.exit()
                elif event.key == pygame.K_ESCAPE or event.key == pygame.K_RETURN or event.key == pygame.K_KP_ENTER:
                    screen.fill((0,0,0), prompt_rect)
                    pygame.display.update(prompt_rect)
                    return

def make_data_file(subject_number, transfer_only):
    column_labels = 'Trial Input Output Predict Error RT'.split()
    session_type = ''
    if transfer_only.lower().startswith('y'):
        session_type = 'transfer'
    else:
        session_type = 'training'        
    data_file_name = '{0}_{1}_data.txt'.format(subject_number, session_type)
    data_file = open(data_file_name, 'w')
    data_file.write('Participant {0}_{1}\t; Experiment run on {2}\n'.format(subject_number, session_type, time_info))
    data_file.write('{0}\t{1}\t{2}\t{3}\t{4}\t{5}\n'.format(*column_labels))
    data_file.close()
    return data_file_name


def write_data(data_file_name, trial_data_type, trial_number, trial_data):
    line = '{0}\t{1}\t{2}\t{3}\t{4}\t{5}\n'.format(trial_number,*trial_data)
    data_file = open(data_file_name, 'a')
    data_file.write(line)
    data_file.close()    


#########################################
### 		experiment functions 	  ###
#########################################

    
def compute_output(input_value):
    # this is the function the participant is trying to learn:
    if input_value < VERTEX:
        output_value = int(round(FUNCTION1(input_value)))
    else:
        output_value = int(round(FUNCTION2(input_value)))
    return output_value

def compute_error(output_value, prediction_value):
    error = abs(output_value - prediction_value)
    return error

def run_blocks(data_file_name, trial_data_type, subject_number, blocks):
    block_number = 0
    trial_number = 0
    number_of_blocks = len(blocks)
    for block in blocks:
        total_accuracy = 0
        total_error = 0
        block_number += 1
        for trial in block:
            trial_number += 1
            input_value = trial
            trial_data = run_trial(trial_number, input_value, trial_data_type)
            if trial_data_type != 'Sample':
                write_data(data_file_name, trial_data_type, trial_number, trial_data)
            trial_error = trial_data[3]
            total_error += trial_error #adds error to total error
            trial_accuracy = (100-(trial_data[3]**2))
            if trial_accuracy < 0: trial_accuracy = 0
            total_accuracy += trial_accuracy
        if trial_data_type != 'Transfer':
            block_error = total_error / len(block)
            block_accuracy = total_accuracy / len(block)
            
            if block_accuracy < 0: block_accuracy = 0
            display_end_of_block(trial_data_type, block_number, number_of_blocks, block_error, block_accuracy)
            
   

def run_trial(trial_number, input_value, trial_data_type):
    # create input, output and prediction bars and put them on the screen #
    screen.fill((0,0,0))
    x_coord = 40
    y_coord = 5*screen.get_height()/6
    frame_width = screen.get_width()/12
    frame_height = 2*screen.get_height()/3
    # make the bars (instances)
    input_bar = Bar(x=x_coord, y=y_coord, width=frame_width,
                    height=frame_height, bar_color=INPUT_BAR_COLOR, label=['Zebon', 'Absorbed'])
    prediction_bar = Bar(x=screen.get_width()/4, y=y_coord, width=frame_width,
                         height=frame_height, bar_color=PREDICTION_BAR_COLOR, label=['Your', 'Prediction'])
    output_bar = Bar(x=screen.get_width()/4 + 1.8*frame_width, y=y_coord, width=frame_width,
                     height=frame_height, bar_color=INPUT_BAR_COLOR, label=['Beros', 'Released'])
    # draw the bars on the screen (no output bar for the test portion)
    input_bar.draw()
    prediction_bar.draw()
    if trial_data_type != 'Transfer':
        output_bar.draw()
    # show information about what's on the screen
    text = TRIAL_INSTRUCTIONS
    if trial_data_type == 'Sample':
        text = SAMPLE_INSTRUCTIONS1
    instruction = TextDisplay(text)
    instruction.draw(x=9*screen.get_width()/16, y=screen.get_height()/3)
    pygame.display.flip()
    input_bar.update(input_value)
    # data values#
    # prediction value starts at 1 and is changed by user
    output_value = compute_output(input_value)
    prediction_value = 0
    init_trial_time = pygame.time.get_ticks()
    
    # get user input and draw their prediction on the screen    
    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            elif event.type == KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    quit_prompt()
                elif event.key == pygame.K_RETURN or event.key == pygame.K_KP_ENTER:
                    if trial_data_type == 'Sample' and prediction_value == 132:
                        output_value = prediction_value
                        output_bar.update(output_value)
                        error_value = compute_error(output_value, prediction_value)
                        display_feedback(trial_data_type, output_value, prediction_value, error_value)
                        return input_value, output_value, prediction_value, error_value
                    
                    elif trial_data_type != 'Sample' and prediction_value != 0:
                        reaction_time = pygame.time.get_ticks()- init_trial_time
                        #if user is finished, program computes error and puts it on screen as feedback
                        if trial_data_type != 'Transfer': output_bar.update(output_value)
                        error_value = compute_error(output_value, prediction_value)
                        display_feedback(trial_data_type, output_value, prediction_value, error_value)
                        return input_value, output_value, prediction_value, error_value, reaction_time
                    
                elif event.key == pygame.K_UP and prediction_value < MAX_OUTPUT_VALUE: prediction_value += JUMP_VALUE
                elif event.key == pygame.K_RIGHT and prediction_value < MAX_OUTPUT_VALUE: prediction_value += 1
                elif event.key == pygame.K_DOWN and prediction_value > 0: prediction_value -= JUMP_VALUE
                elif event.key == pygame.K_LEFT and prediction_value > 0: prediction_value -= 1
                if prediction_value > MAX_OUTPUT_VALUE: prediction_value = MAX_OUTPUT_VALUE
                elif prediction_value < 1: prediction_value = 0
        prediction_bar.update(prediction_value)
        
def main_procedure():
    
    ###show instructions###
    display_instructions(TRAINING_INSTRUCTIONS)
    
    ### show sample block ###
    run_blocks(data_file_name, 'Sample', subject_number, SAMPLE_BLOCK)
    display_instructions(SAMPLE_INSTRUCTIONS2)
    
    ###start the training blocks###
    run_blocks(data_file_name, 'Training', subject_number, TRAINING_BLOCKS)
    display_instructions(TEST_INSTRUCTIONS)
    run_blocks(data_file_name, 'Transfer', subject_number, TRANSFER_BLOCK)
		
    display_end_of_experiment()
    return

######################
### Run everything!###
######################

### program process ###
	
if __name__ == "__main__":
    print('Welcome to the experiment.')
    print()
    time_info = datetime.datetime.isoformat(datetime.datetime.now())
    subject_number = None
    transfer_only = ''  
    session_type = 'training'
    ### get the subject number ###
    while not subject_number:
            subject_number = input('Please enter the subject number: ')
            try:
                    int(subject_number)
            except ValueError:
                    print('Numbers only, please.')
                    subject_number = None
            if subject_number:
                    if PATH not in os.listdir('.'):
                            os.mkdir(PATH)
                            os.chdir(PATH)
                            data_file_name = make_data_file(subject_number, transfer_only)
                    elif '{0}_{1}_data.txt'.format(subject_number, session_type)in os.listdir(PATH):
                            overwrite = input('Subject already exists. Overwrite? Y/N:')
                            if overwrite.lower().startswith('y'):
                                    os.chdir(PATH)
                                    data_file_name = make_data_file(subject_number, transfer_only)
                            else: subject_number = None
                    else:
                            os.chdir(PATH)
                            data_file_name = make_data_file(subject_number, transfer_only)
            
    fullscreen_mode = input('Fullscreen Mode? \'Y\' if yes:')

                    
    ###initialize graphics###
    pygame.init()
    width, height = 800, 600
    pygame.key.set_repeat(250, 50)
    if fullscreen_mode.lower().startswith('y'):
            screen = pygame.display.set_mode((width, height), pygame.FULLSCREEN)
            pygame.mouse.set_visible(False)
    else:
            screen = pygame.display.set_mode((width, height))
            pygame.display.set_caption('NASA Experiment')
    main_procedure()
    pygame.quit()
    sys.exit()
    
