from PIL import Image,ImageDraw,ImageFont
import json,math
posts=json.load(open('content/posts.json'));font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
for i,p in enumerate(posts):
 im=Image.new('RGB',(1000,1500),'#f5f0e5');d=ImageDraw.Draw(im);d.ellipse((480,-100,1180,600),fill='#d9e5d6');d.ellipse((-140,630,350,1120),fill='#e4d4bd')
 theme=['bottle','mirror','mirror','plate','moon','shoe','bottle','water','leaf','book','sun','plate'][i]
 green='#347568';dark='#183e38';light='#a3bda1';gold='#e3b86b'
 if theme=='bottle':
  d.rounded_rectangle((300,370,700,920),radius=70,fill=green);d.rounded_rectangle((365,250,635,410),radius=15,fill=dark);d.rectangle((340,550,660,780),fill='#f5f0e5');d.ellipse((445,590,555,730),fill=light);d.line((500,615,500,710),fill=dark,width=5)
 elif theme=='mirror':
  d.rounded_rectangle((450,650,550,950),radius=30,fill=gold);d.ellipse((240,190,760,770),fill=dark);d.ellipse((270,220,730,740),fill='#c5dcd8');d.arc((310,280,650,660),200,260,fill='white',width=18);d.rounded_rectangle((210,900,790,950),radius=20,fill=green)
 elif theme=='plate':
  d.ellipse((170,230,830,890),fill='#d9e5d6');d.ellipse((210,270,790,850),fill='white');d.ellipse((260,320,740,800),outline=light,width=6)
  for x,y,c in [(380,440,green),(500,400,light),(600,470,'#d2765f'),(420,600,gold),(560,650,'#d2765f')]:d.ellipse((x-80,y-80,x+80,y+80),fill=c)
  d.line((110,340,110,850),fill=dark,width=18);d.line((890,340,890,850),fill=dark,width=18)
 elif theme=='moon':
  d.ellipse((240,250,760,770),fill=gold);d.ellipse((410,180,820,680),fill='#f5f0e5')
  for x,y in [(230,220),(800,730),(310,860),(780,300)]:d.line((x-20,y,x+20,y),fill=green,width=6);d.line((x,y-20,x,y+20),fill=green,width=6)
 elif theme=='shoe':
  d.polygon([(200,700),(340,390),(490,410),(610,620),(800,700),(820,840),(180,840)],fill=green);d.rounded_rectangle((170,800,840,880),radius=20,fill=dark)
  for y in [500,560,620]:d.line((370,y,530,y+35),fill='#f5f0e5',width=14)
 elif theme=='water':
  d.polygon([(300,250),(700,250),(650,900),(350,900)],fill='#c5dcd8');d.polygon([(325,470),(675,470),(645,870),(355,870)],fill=green);d.line((300,250,700,250),fill=dark,width=12);d.ellipse((380,370,540,530),outline=gold,width=12)
 elif theme=='book':
  d.rounded_rectangle((190,300,810,850),radius=25,fill=green);d.rectangle((225,330,490,820),fill='white');d.rectangle((510,330,775,820),fill='#e4e8db');d.line((500,320,500,840),fill=dark,width=12)
  for y in range(420,720,70):d.line((260,y,450,y),fill=light,width=8);d.line((550,y,730,y),fill=light,width=8)
 elif theme=='sun':
  d.ellipse((320,320,680,680),fill=gold)
  for a in range(0,360,45):
   rad=math.radians(a);d.line((500+230*math.cos(rad),500+230*math.sin(rad),500+330*math.cos(rad),500+330*math.sin(rad)),fill=gold,width=20)
  d.arc((180,720,820,1040),180,360,fill=green,width=40)
 else:
  d.ellipse((240,230,570,900),fill=green);d.ellipse((400,510,800,850),fill=light);d.line((400,900,420,360),fill=dark,width=10)
 d.rounded_rectangle((100,1020,900,1360),radius=30,fill=dark);d.text((145,1080),p['title'],font=ImageFont.truetype(font,38),fill='white');d.text((145,1190),'STAY YOUNG',font=ImageFont.truetype(font,32),fill='#d9e5d6');d.text((145,1260),'Make room for everyday care.',font=ImageFont.truetype(font,24),fill='white');im.save(p['asset'],optimize=True)
 p['alt']='Original '+{'bottle':'skincare bottle','mirror':'self-care mirror','plate':'colorful food plate','moon':'moon and stars','shoe':'walking shoe','water':'glass of water','book':'open book','sun':'morning sun','leaf':'botanical leaf'}[theme]+' illustration: '+p['title']
open('content/posts.json','w').write(json.dumps(posts,indent=2))
