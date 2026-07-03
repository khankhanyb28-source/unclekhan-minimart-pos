package cn.com.pos.usbdemo;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.sql.Date;
import java.text.SimpleDateFormat;
import zj.com.customize.sdk.Other;

import com.pos.command.sdk.Command;
import com.pos.command.sdk.PrintPicture;
import com.pos.command.sdk.PrinterCommand;
import com.pos.command.sdk.UsbController1;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.res.AssetManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.BitmapDrawable;
import android.hardware.usb.UsbDevice;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.RadioButton;
import android.widget.Toast;

public class PrintDemo extends Activity implements OnClickListener{
    private Button btn_conn = null;
    private Button btnSend = null;
    private Button btn_test = null;
    private Button btnClose = null;
    private EditText txt_content = null;
    private Button btn_printA = null;
    private ImageView imageViewPicture = null;
    private static boolean is58mm = true;
	private RadioButton width_58mm, width_80, thai, big5, Simplified, Korean;
	private CheckBox hexBox;
	private Button btn_BMP = null;
	private Button btn_ChoseCommand = null;
	private Button btn_prtsma = null;
	private Button btn_prttableButton = null;
	private Button btn_prtcodeButton = null;
    
    private int[][] u_infor;
    static UsbController1 usbCtrl = null;
    static UsbDevice dev = null;
    
/******************************************************************************************************/

    final String[] itemsen = { "Print Init", "Print and Paper", "Standard ASCII font", "Compressed ASCII font", "Normal size",			
    	    "Double high power wide", "Twice as high power wide", "Three times the high-powered wide", "Off emphasized mode",
            "Choose bold mode", "Cancel inverted Print", "Invert selection Print", "Cancel black and white reverse display",
            "Choose black and white reverse display",
    		"Cancel rotated clockwise 90 °", "Select the clockwise rotation of 90 °", "Feed paper Cut", "Beep", "Standard CashBox", 
    		"Open CashBox", "Char Mode", "Chinese Mode", "Print SelfTest", "DisEnable Button", "Enable Button" ,
    		"Set Underline", "Cancel Underline", "Hex Mode" };
	final byte[][] byteCommands = { 
			{ 0x1b, 0x40, 0x0a },// Print Init
			{ 0x0a }, //Print and feed paper
			{ 0x1b, 0x4d, 0x00 },// Standard ASCII font
			{ 0x1b, 0x4d, 0x01 },// Compressed ASCII font
			{ 0x1d, 0x21, 0x00 },// Normal size
			{ 0x1d, 0x21, 0x11 },// Double high power wide
			{ 0x1b, 0x45, 0x00 },// Cancel bold mode
			{ 0x1b, 0x45, 0x01 },// Select bold mode
			{ 0x1b, 0x7b, 0x00 },// Cancel Inverted Printing
			{ 0x1b, 0x7b, 0x01 },// Select Inverted Printing
			{ 0x1d, 0x42, 0x00 },// Cancel black and white reflection
			{ 0x1d, 0x42, 0x01 },// Select black and white reverse display
			{ 0x1b, 0x56, 0x00 },// Cancel rotated clockwise 90
			{ 0x1b, 0x56, 0x01 },// Select the clockwise rotation of 90 °
			{ 0x0a, 0x1d, 0x56, 0x42, 0x01, 0x0a },//Cutter command
			{ 0x1b, 0x42, 0x03, 0x03 },//Beep command
			{ 0x1b, 0x70, 0x00, 0x50, 0x50 },//Cash Box Instructions
			{ 0x10, 0x14, 0x00, 0x05, 0x05 },//Real time cash box instruction
			{ 0x1c, 0x2e },// Entering character mode
			{ 0x1c, 0x26 }, //Entering Chinese mode
			{ 0x1f, 0x11, 0x04 }, //Print self inspection page
			{ 0x1b, 0x63, 0x35, 0x01 }, //DisEnable Button
			{ 0x1b, 0x63, 0x35, 0x00 }, //Enable Button
			{ 0x1b, 0x2d, 0x02, 0x1c, 0x2d, 0x02 }, //Set Underline
			{ 0x1b, 0x2d, 0x00, 0x1c, 0x2d, 0x00 }, //Cancel Underline
			{ 0x1f, 0x11, 0x03 }, //Hex Mode
	};

	final String[] codebar = { "UPC_A", "UPC_E", "JAN13(EAN13)", "JAN8(EAN8)", 
							   "CODE39", "ITF", "CODABAR", "CODE93", "CODE128", "QR Code" };
	final byte[][] byteCodebar = { 
			{ 0x1b, 0x40 },
			{ 0x1b, 0x40 },
			{ 0x1b, 0x40 },
			{ 0x1b, 0x40 },
			{ 0x1b, 0x40 },
			{ 0x1b, 0x40 },
			{ 0x1b, 0x40 },
			{ 0x1b, 0x40 },
			{ 0x1b, 0x40 },
			{ 0x1b, 0x40 },
	};
/******************************************************************************************************/
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.main);
		btn_conn = (Button)findViewById(R.id.btn_conn);
		btnSend = (Button)findViewById(R.id.btnSend);
		btn_test = (Button)findViewById(R.id.btn_test);
		btnClose = (Button)findViewById(R.id.btnClose);
		txt_content = (EditText)findViewById(R.id.txt_content);
		
		btn_conn.setOnClickListener(this);
		btnSend.setOnClickListener(this);
		btn_test.setOnClickListener(this);
		btnClose.setOnClickListener(this);
		
		btn_printA = (Button)findViewById(R.id.btn_bmp);
		btn_printA.setOnClickListener(this);
		
		imageViewPicture = (ImageView) findViewById(R.id.imageViewPictureUSB);
		imageViewPicture.setOnClickListener(this);
		Bitmap bm = getImageFromAssetsFile("Look.bmp");
		if (null != bm) {
			imageViewPicture.setImageBitmap(bm);
		}


		hexBox = (CheckBox)findViewById(R.id.checkBoxHEX);
		hexBox.setOnClickListener(this);
		
		width_58mm = (RadioButton)findViewById(R.id.width_58mm);
		width_58mm.setOnClickListener(this);
		
		width_80 = (RadioButton)findViewById(R.id.width_80mm);
		width_80.setOnClickListener(this);
		
		btn_BMP = (Button)findViewById(R.id.btn_printpicture);
		btn_BMP.setOnClickListener(this);
		
		btn_ChoseCommand = (Button)findViewById(R.id.btn_prtcommand);
		btn_ChoseCommand.setOnClickListener(this);
		
		btn_prtsma = (Button)findViewById(R.id.btn_prtsma);
		btn_prtsma.setOnClickListener(this);
		
		btn_prttableButton = (Button)findViewById(R.id.btn_prttable);
		btn_prttableButton.setOnClickListener(this);
		
		btn_prtcodeButton = (Button)findViewById(R.id.btn_prtbarcode);
		btn_prtcodeButton.setOnClickListener(this);
		
		Simplified = (RadioButton)findViewById(R.id.gbk12);
		
		big5 = (RadioButton)findViewById(R.id.big5);
		
		thai = (RadioButton)findViewById(R.id.thai);
		
		Korean = (RadioButton)findViewById(R.id.kor);
		
    	btnSend.setEnabled(false);
    	btn_test.setEnabled(false);
    	btnClose.setEnabled(false);
    	btn_printA.setEnabled(false);
    	btn_BMP.setEnabled(false);
		btn_ChoseCommand.setEnabled(false);
		btn_prtcodeButton.setEnabled(false);
		btn_prtsma.setEnabled(false);
		btn_prttableButton.setEnabled(false);
		Simplified.setEnabled(false);
		Korean.setEnabled(false);
		big5.setEnabled(false);
		thai.setEnabled(false);
		
		usbCtrl = new UsbController1(this,mHandler);
		u_infor = new int[8][2];
		u_infor[0][0] = 0x1CBE;
		u_infor[0][1] = 0x0003;
		u_infor[1][0] = 0x1CB0;
		u_infor[1][1] = 0x0003;
		u_infor[2][0] = 0x0483;
		u_infor[2][1] = 0x5740;
		u_infor[3][0] = 0x0493;
		u_infor[3][1] = 0x8760;
		u_infor[4][0] = 0x0416;
		u_infor[4][1] = 0x5011;
        u_infor[5][0] = 0x0416;
		u_infor[5][1] = 0xAABB;
		u_infor[6][0] = 0x1659;
		u_infor[6][1] = 0x8965;
		u_infor[7][0] = 0x0483;
		u_infor[7][1] = 0x5741;
	}

    @Override
    public void onDestroy() {
        super.onDestroy();
        usbCtrl.close();
    }
    

    public boolean CheckUsbPermission(){
		if( dev != null ){
			if( usbCtrl.isHasPermission(dev)){
				return true;
			}
		}
		btnSend.setEnabled(false);
		btn_test.setEnabled(false);
		btnClose.setEnabled(false);
		btn_printA.setEnabled(false);
		btn_BMP.setEnabled(false);
		btn_ChoseCommand.setEnabled(false);
		btn_prtcodeButton.setEnabled(false);
		btn_prtsma.setEnabled(false);
		btn_prttableButton.setEnabled(false);
		Simplified.setEnabled(false);
		Korean.setEnabled(false);
		big5.setEnabled(false);
		thai.setEnabled(false);
		btn_conn.setEnabled(true);
		Toast.makeText(getApplicationContext(), getString(R.string.msg_conn_state),
                Toast.LENGTH_SHORT).show();
    	return false;
    }
    
	@SuppressLint("HandlerLeak") private final  Handler mHandler = new Handler() {
		@Override
        public void handleMessage(Message msg) {
            switch (msg.what) {
            case UsbController1.USB_CONNECTED:
            	Toast.makeText(getApplicationContext(), getString(R.string.msg_getpermission),
                        Toast.LENGTH_SHORT).show();
            	btnSend.setEnabled(true);
            	btn_test.setEnabled(true);
            	btnClose.setEnabled(true);
            	btn_printA.setEnabled(true);
            	btn_BMP.setEnabled(true);
    			btn_ChoseCommand.setEnabled(true);
    			btn_prtcodeButton.setEnabled(true);
    			btn_prtsma.setEnabled(true);
    			btn_prttableButton.setEnabled(true);
    			Simplified.setEnabled(true);
    			Korean.setEnabled(true);
    			big5.setEnabled(true);
    			thai.setEnabled(true);
            	btn_conn.setEnabled(false);
            	break;
            default:
            	break;
            }
        }
    };
    
	@Override
	public void onClick(View v) {
		// TODO Auto-generated method stub
		switch (v.getId()) {
		case R.id.btn_conn:{

			usbCtrl.close();
			int  i = 0;
			for( i = 0 ; i < 8 ; i++ ){
				dev = usbCtrl.getDev(u_infor[i][0],u_infor[i][1]);
				if(dev != null)
					break;
			}
			
			if( dev != null ){
				if( !(usbCtrl.isHasPermission(dev))){

					usbCtrl.getPermission(dev);
				}else{
	            	Toast.makeText(getApplicationContext(), getString(R.string.msg_getpermission),
	                        Toast.LENGTH_SHORT).show();
	            	btnSend.setEnabled(true);
	            	btn_test.setEnabled(true);
	            	btnClose.setEnabled(true);
	            	btn_printA.setEnabled(true);
	            	btn_BMP.setEnabled(true);
	    			btn_ChoseCommand.setEnabled(true);
	    			btn_prtcodeButton.setEnabled(true);
	    			btn_prtsma.setEnabled(true);
	    			btn_prttableButton.setEnabled(true);
	    			Simplified.setEnabled(true);
	    			Korean.setEnabled(true);
	    			big5.setEnabled(true);
	    			thai.setEnabled(true);
	            	btn_conn.setEnabled(false);
				}
			}
		
			break;
		}
		case R.id.btnSend:{			
			if (hexBox.isChecked()) {
				String str = txt_content.getText().toString().trim();//去掉头尾空白
				if(str.length() > 0){
					str = Other.RemoveChar(str, ' ').toString();
					if (str.length() <= 0)
						return;
					if ((str.length() % 2) != 0) {
						Toast.makeText(getApplicationContext(), getString(R.string.msg_state),
								Toast.LENGTH_SHORT).show();
						return;
					}
					byte[] buf = Other.HexStringToBytes(str);
					usbCtrl.sendByte(buf, dev);
				}else{
					Toast.makeText(PrintDemo.this, getText(R.string.empty), Toast.LENGTH_SHORT).show();
				}
			} else {
                String msg = txt_content.getText().toString();
                if( msg.length() > 0 ){
                	if(thai.isChecked()){
    					SendDataByte(new byte[]{0x1c, 0x2e, 0x1b, 0x74, (byte) 0xff});
    					SendDataThai(msg);
    				}else if(big5.isChecked()){
    					SendDataByte(new byte[]{0x1c, 0x26, 0x1b, 0x74, (byte) 0x00});
    					SendDataBig5(msg);
    				}else if(Korean.isChecked()){
    					SendDataByte(new byte[]{0x1c, 0x26, 0x1b, 0x74, (byte) 0x00});
    					SendDataKor(msg);
    				}else if(Simplified.isChecked()){
    					SendDataByte(new byte[]{0x1c, 0x26, 0x1b, 0x74, (byte) 0x00});
    					SendDataString(msg);
    				}
                }else{
					Toast.makeText(PrintDemo.this, getText(R.string.empty), Toast.LENGTH_SHORT).show();
				}
			}
			break;
		}
		case R.id.btn_test:{
			BluetoothPrintTest();
			break;
		}
		case R.id.btnClose:{
			usbCtrl.close();
        	btnSend.setEnabled(false);
        	btn_test.setEnabled(false);
        	btnClose.setEnabled(false);
        	btn_printA.setEnabled(false);
        	btn_BMP.setEnabled(false);
			btn_ChoseCommand.setEnabled(false);
			btn_prtcodeButton.setEnabled(false);
			btn_prtsma.setEnabled(false);
			btn_prttableButton.setEnabled(false);
			Simplified.setEnabled(false);
			Korean.setEnabled(false);
			big5.setEnabled(false);
			thai.setEnabled(false);
        	btn_conn.setEnabled(true);
			break;
		}
		case R.id.width_58mm:
		case R.id.width_80mm:{
			is58mm = v == width_58mm;
			width_58mm.setChecked(is58mm);
			width_80.setChecked(!is58mm);
			break;
		}
		case R.id.btn_bmp:{
			String txt_msg = txt_content.getText().toString(); 
			if(txt_msg.length() == 0){
				Toast.makeText(PrintDemo.this, getText(R.string.empty1), Toast.LENGTH_SHORT).show();
				return;
			}else{
				Bitmap bm1 = getImageFromAssetsFile("Look.bmp");
				if(width_58mm.isChecked()){
					Bitmap bmp = Other.createAppIconText(bm1,txt_msg,24,is58mm,200);
				//	imageViewPicture.setImageBitmap(bmp);
					byte[] buffer = PrinterCommand.POS_Set_PrtInit();
					byte[] sp = PrinterCommand.POS_Set_LineSpace(0);
					int nMode = 0;
					int nPaperWidth = 384;
					
					if(bmp != null)
					{
						usbCtrl.sendByte(buffer, dev);
						usbCtrl.sendByte(sp, dev);
						byte[] data = PrintPicture.POS_PrintBMP(bmp, nPaperWidth, nMode);
						usbCtrl.sendByte(data, dev);
						usbCtrl.sendByte(new byte[]{0x1b, 0x4a, 0x30, 0x1d, 0x56, 0x42, 0x01}, dev);
					}
				}
				else if (width_80.isChecked()){
					Bitmap bmp = Other.createAppIconText(bm1,txt_msg,24,false,200);
				//	imageViewPicture.setImageBitmap(bmp);
					byte[] buffer = PrinterCommand.POS_Set_PrtInit();
					byte[] sp = PrinterCommand.POS_Set_LineSpace(0);
					int nMode = 0;
					
					int nPaperWidth = 576;
					if(bmp != null)
					{
						usbCtrl.sendByte(buffer, dev);
						usbCtrl.sendByte(sp, dev);
						byte[] data = PrintPicture.POS_PrintBMP(bmp, nPaperWidth, nMode);
						usbCtrl.sendByte(data, dev);
						usbCtrl.sendByte(new byte[]{0x1b, 0x4a, 0x30, 0x1d, 0x56, 0x42, 0x01}, dev);
					}
				}
			}
			break;
		}
		case R.id.btn_printpicture:{
			Print_BMP();
			break;
		}
		case R.id.btn_prtcommand:{

		    new AlertDialog.Builder(PrintDemo.this).setTitle(getText(R.string.chosecommand))
				.setItems(itemsen, new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int which) {
						SendDataByte(byteCommands[which]);
						try {
							if(which == 16 || which == 17 || which == 18 || which == 19 || which == 22
							|| which == 23 || which == 24|| which == 0 || which == 1 || which == 27){
								return ;
							}else {
								SendDataByte("Thermal Receipt Printer ABCDEFGabcdefg123456,.;'/[{}]!\nThermal Receipt PrinterABCDEFGabcdefg123456,.;'/[{}]!\nThermal Receipt PrinterABCDEFGabcdefg123456,.;'/[{}]!\nThermal Receipt PrinterABCDEFGabcdefg123456,.;'/[{}]!\nThermal Receipt PrinterABCDEFGabcdefg123456,.;'/[{}]!\nThermal Receipt PrinterABCDEFGabcdefg123456,.;'/[{}]!\n".getBytes("GBK"));
							}
							
						} catch (UnsupportedEncodingException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
					}
				}).create().show();	

			break;
		}
		case R.id.btn_prtsma:{
			Print_Ex();
			break;
		}
		case R.id.btn_prttable:{
			PrintTable();
			SendDataByte(Command.LF);
			break;
		}
		case R.id.btn_prtbarcode:{
			printBarCode();
			break;
		}
		default:
			break;
		}
	}
/****************************************************************************************************/
	/* 
	* print a picture
	*/
	private void Print_BMP(){

		byte[] buffer = PrinterCommand.POS_Set_PrtInit();
		Bitmap mBitmap = ((BitmapDrawable) imageViewPicture.getDrawable())
				.getBitmap();
		int nMode = 0;
		int nPaperWidth = 384;
		if(width_58mm.isChecked())
			nPaperWidth = 384;
		else if (width_80.isChecked())
			nPaperWidth = 576;
		if(mBitmap != null)
		{
			byte[] data = PrintPicture.POS_PrintBMP(mBitmap, nPaperWidth, nMode);
			usbCtrl.sendByte(buffer,dev);
			usbCtrl.sendByte(data,dev);
			usbCtrl.sendByte(new byte[]{0x1b, 0x4a, 0x30, 0x1d, 0x56, 0x42, 0x01, 0x0a, 0x1b, 0x40 },dev);
		}		
	}

	/**
	 * Print Custom Tables
	 */
	@SuppressLint("SimpleDateFormat") private void PrintTable(){
	        SimpleDateFormat formatter = new SimpleDateFormat ("yyyy/MM/dd/ HH:mm:ss ");
			Date curDate = new Date(System.currentTimeMillis());
			String str = formatter.format(curDate);
			String date = str + "\n\n\n\n\n\n";	
			if(is58mm){

				Command.ESC_Align[2] = 0x02;
				byte[][] allbuf;
				try {
					allbuf = new byte[][]{

							Command.ESC_Init, Command.ESC_Three,
							String.format("┏━━┳━━━┳━━┳━━━━┓\n").getBytes("GBK"),
							String.format("┃XXXX┃%-6s┃XXXX┃%-8s┃\n","XXXX","XXXX").getBytes("GBK"),
							String.format("┣━━╋━━━╋━━╋━━━━┫\n").getBytes("GBK"),
							String.format("┃XXXX┃%2d/%-3d┃XXXX┃%-8d┃\n",1,222,555).getBytes("GBK"),
							String.format("┣━━┻┳━━┻━━┻━━━━┫\n").getBytes("GBK"),
							String.format("┃XXXXXX┃%-18s┃\n","【XX】XXXX/XXXXXX").getBytes("GBK"),
							String.format("┣━━━╋━━┳━━┳━━━━┫\n").getBytes("GBK"),
							String.format("┃XXXXXX┃%-2s┃XXXX┃%-8s┃\n","XXXX","XXXX").getBytes("GBK"),
							String.format("┗━━━┻━━┻━━┻━━━━┛\n").getBytes("GBK"),
							Command.ESC_Align, "\n".getBytes("GBK")
					};
					byte[] buf = Other.byteArraysToBytes(allbuf);
					SendDataByte(buf);
					SendDataString(date);
					SendDataByte(Command.GS_V_m_n);
				} catch (UnsupportedEncodingException e) {

					e.printStackTrace();
				}
			}else {

				Command.ESC_Align[2] = 0x02;
				byte[][] allbuf;
				try {
					allbuf = new byte[][]{

							Command.ESC_Init, Command.ESC_Three,
							String.format("┏━━┳━━━━━━━┳━━┳━━━━━━━━┓\n").getBytes("GBK"),
							String.format("┃XXXX┃%-14s┃XXXX┃%-16s┃\n", "XXXX", "XXXX").getBytes("GBK"),
							String.format("┣━━╋━━━━━━━╋━━╋━━━━━━━━┫\n").getBytes("GBK"),
							String.format("┃XXXX┃%6d/%-7d┃XXXX┃%-16d┃\n", 1, 222, 55555555).getBytes("GBK"),
							String.format("┣━━┻┳━━━━━━┻━━┻━━━━━━━━┫\n").getBytes("GBK"),
							String.format("┃XXXXXX┃%-34s┃\n", "【XX】XXXX/XXXXXX").getBytes("GBK"),
							String.format("┣━━━╋━━━━━━┳━━┳━━━━━━━━┫\n").getBytes("GBK"),
							String.format("┃XXXXXX┃%-12s┃XXXX┃%-16s┃\n", "XXXX", "XXXX").getBytes("GBK"),
							String.format("┗━━━┻━━━━━━┻━━┻━━━━━━━━┛\n").getBytes("GBK"),
							Command.ESC_Align, "\n".getBytes("GBK")
					};
					byte[] buf = Other.byteArraysToBytes(allbuf);
					SendDataByte(buf);
					SendDataString(date);
					SendDataByte(Command.GS_V_m_n);
				} catch (UnsupportedEncodingException e) {

					e.printStackTrace();
				}
			}

	}

	/**
	 * Print Custom Tickets
	 */
	@SuppressLint("SimpleDateFormat") private void Print_Ex(){
			SimpleDateFormat formatter = new SimpleDateFormat ("yyyy/MM/dd/ HH:mm:ss ");
			Date curDate = new Date(System.currentTimeMillis());
			String str = formatter.format(curDate);
			String date = str + "\n\n\n\n\n\n";	
			if (is58mm) {

				try {
					byte[] qrcode = PrinterCommand.getBarCommand("Electronic Thermal Receipt Printer!", 0, 3, 6);//
					Command.ESC_Align[2] = 0x01;
					SendDataByte(Command.ESC_Align);
					SendDataByte(qrcode);

					SendDataByte(Command.ESC_Align);
					Command.GS_ExclamationMark[2] = 0x11;
					SendDataByte(Command.GS_ExclamationMark);
					SendDataByte("NIKE Shop\n".getBytes("GBK"));
					Command.ESC_Align[2] = 0x00;
					SendDataByte(Command.ESC_Align);
					Command.GS_ExclamationMark[2] = 0x00;
					SendDataByte(Command.GS_ExclamationMark);
					SendDataByte("Number:  888888\nReceipt  S00003333\nCashier：1001\nDate：xxxx-xx-xx\nPrint Time：xxxx-xx-xx  xx:xx:xx\n".getBytes("GBK"));
					SendDataByte("Name    Quantity    price  Money\nShoes   10.00       899     8990\nBall    10.00       1599    15990\n".getBytes("GBK"));
					SendDataByte("Quantity：             20.00\ntotal：                16889.00\npayment：              17000.00\nKeep the change：      111.00\n".getBytes("GBK"));
					SendDataByte("company name：NIKE\nSite：www.xxx.xxx\naddress：ShenzhenxxAreaxxnumber\nphone number：0755-11111111\nHelpline：400-xxx-xxxx\n================================\n".getBytes("GBK"));
					Command.ESC_Align[2] = 0x01;
					SendDataByte(Command.ESC_Align);
					Command.GS_ExclamationMark[2] = 0x11;
					SendDataByte(Command.GS_ExclamationMark);
					SendDataByte("Welcome again!\n".getBytes("GBK"));
					Command.ESC_Align[2] = 0x00;
					SendDataByte(Command.ESC_Align);
					Command.GS_ExclamationMark[2] = 0x00;
					SendDataByte(Command.GS_ExclamationMark);
					
					SendDataByte("(The above information is for testing template, if agree, is purely coincidental!)\n".getBytes("GBK"));
					Command.ESC_Align[2] = 0x02;
					SendDataByte(Command.ESC_Align);
					SendDataString(date);
					SendDataByte(Command.GS_i);
				} catch (UnsupportedEncodingException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			} else {
				try {
					byte[] qrcode = PrinterCommand.getBarCommand("Zijiang Electronic Thermal Receipt Printer!", 0, 3, 8);
					Command.ESC_Align[2] = 0x01;
					SendDataByte(Command.ESC_Align);
					SendDataByte(qrcode);

					Command.ESC_Align[2] = 0x01;
					SendDataByte(Command.ESC_Align);
					Command.GS_ExclamationMark[2] = 0x11;
					SendDataByte(Command.GS_ExclamationMark);
					SendDataByte("NIKE Shop\n".getBytes("GBK"));
					Command.ESC_Align[2] = 0x00;
					SendDataByte(Command.ESC_Align);
					Command.GS_ExclamationMark[2] = 0x00;
					SendDataByte(Command.GS_ExclamationMark);
					SendDataByte("Number: 888888\nReceipt  S00003333\nCashier：1001\nDate：xxxx-xx-xx\nPrint Time：xxxx-xx-xx  xx:xx:xx\n".getBytes("GBK"));
					SendDataByte("Name                    Quantity price  Money\nNIKErunning shoes        10.00   899     8990\nNIKEBasketball Shoes     10.00   1599    15990\n".getBytes("GBK"));
					SendDataByte("Quantity：               20.00\ntotal：                  16889.00\npayment：                17000.00\nKeep the change：                111.00\n".getBytes("GBK"));
					SendDataByte("company name：NIKE\nSite：www.xxx.xxx\naddress：shenzhenxxAreaxxnumber\nphone number：0755-11111111\nHelpline：400-xxx-xxxx\n================================================\n".getBytes("GBK"));
					Command.ESC_Align[2] = 0x01;
					SendDataByte(Command.ESC_Align);
					Command.GS_ExclamationMark[2] = 0x11;
					SendDataByte(Command.GS_ExclamationMark);
					SendDataByte("Welcome again!\n".getBytes("GBK"));
					Command.ESC_Align[2] = 0x00;
					SendDataByte(Command.ESC_Align);
					Command.GS_ExclamationMark[2] = 0x00;
					SendDataByte(Command.GS_ExclamationMark);
					SendDataByte("(The above information is for testing template, if agree, is purely coincidental!)\n".getBytes("GBK"));
					Command.ESC_Align[2] = 0x02;
					SendDataByte(Command.ESC_Align);
					SendDataString(date);
					SendDataByte(Command.GS_i);
				} catch (UnsupportedEncodingException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}

	}

	/**
	 * Print barcode and QR code
	 */
	public void printBarCode() {

		new AlertDialog.Builder(PrintDemo.this).setTitle(getText(R.string.btn_prtcode))
		.setItems(codebar, new DialogInterface.OnClickListener() {
			public void onClick(DialogInterface dialog, int which) {
				SendDataByte(byteCodebar[which]);
				String str = txt_content.getText().toString();
				if(which == 0)
				{
					if(str.length() == 11 || str.length() == 12)
					{
						byte[] code = PrinterCommand.getCodeBarCommand(str, 65, 3, 168, 0, 2);
						SendDataByte(new byte[]{0x1b, 0x61, 0x00});
						SendDataString("UPC_A");
						SendDataByte(code);
					}else {
						Toast.makeText(PrintDemo.this, getText(R.string.msg_error), Toast.LENGTH_SHORT).show();
						return;
					}
				}
				else if(which == 1)
				{
					if(str.length() == 6 || str.length() == 7)
					{
						byte[] code = PrinterCommand.getCodeBarCommand(str, 66, 3, 168, 0, 2);
						SendDataByte(new byte[]{0x1b, 0x61, 0x00});
						SendDataString("UPC_E");
						SendDataByte(code);
					}else {
						Toast.makeText(PrintDemo.this, getText(R.string.msg_error), Toast.LENGTH_SHORT).show();
						return;
					}
				}
				else if(which == 2)
				{
					if(str.length() == 12 || str.length() == 13)
					{
						byte[] code = PrinterCommand.getCodeBarCommand(str, 67, 3, 168, 0, 2);
						SendDataByte(new byte[]{0x1b, 0x61, 0x00});
						SendDataString("JAN13(EAN13)");
						SendDataByte(code);
					}else {
						Toast.makeText(PrintDemo.this, getText(R.string.msg_error), Toast.LENGTH_SHORT).show();
						return;
					}
				}
				else if(which == 3)
				{
					if(str.length() >0 )
					{
						byte[] code = PrinterCommand.getCodeBarCommand(str, 68, 3, 168, 0, 2);
						SendDataByte(new byte[]{0x1b, 0x61, 0x00});
						SendDataString("JAN8(EAN8)");
						SendDataByte(code);
					}else {
						Toast.makeText(PrintDemo.this, getText(R.string.msg_error), Toast.LENGTH_SHORT).show();
						return;
					}
				}
				else if(which == 4)
				{
					if(str.length() == 0)
					{
						Toast.makeText(PrintDemo.this, getText(R.string.msg_error), Toast.LENGTH_SHORT).show();
						return;
					}
					else
					{
						byte[] code = PrinterCommand.getCodeBarCommand(str, 69, 3, 168, 1, 2);
						SendDataString("CODE39");
						SendDataByte(new byte[]{0x1b, 0x61, 0x00 });
						SendDataByte(code);
					}
				}
				else if(which == 5)
				{
					if(str.length() == 0)
					{
						Toast.makeText(PrintDemo.this, getText(R.string.msg_error), Toast.LENGTH_SHORT).show();
						return;
					}
					else
					{
						byte[] code = PrinterCommand.getCodeBarCommand(str, 70, 3, 168, 1, 2);
						SendDataString("ITF");
						SendDataByte(new byte[]{0x1b, 0x61, 0x00 });
						SendDataByte(code);
					}
				}
				else if(which == 6)
				{
					if(str.length() == 0)
					{
						Toast.makeText(PrintDemo.this, getText(R.string.msg_error), Toast.LENGTH_SHORT).show();
						return;
					}
					else
					{
						byte[] code = PrinterCommand.getCodeBarCommand(str, 71, 3, 168, 1, 2);
						SendDataString("CODABAR");
						SendDataByte(new byte[]{0x1b, 0x61, 0x00 });
						SendDataByte(code);
					}
				}
				else if(which == 7)
				{
					if(str.length() == 0)
					{
						Toast.makeText(PrintDemo.this, getText(R.string.msg_error), Toast.LENGTH_SHORT).show();
						return;
					}
					else
					{
						byte[] code = PrinterCommand.getCodeBarCommand(str, 72, 3, 168, 1, 2);
						SendDataString("CODE93");
						SendDataByte(new byte[]{0x1b, 0x61, 0x00 });
						SendDataByte(code);
					}
				}
				else if(which == 8)
				{
					if(str.length() == 0)
					{
						Toast.makeText(PrintDemo.this, getText(R.string.msg_error), Toast.LENGTH_SHORT).show();
						return;
					}
					else
					{
						byte[] code = PrinterCommand.getCodeBarCommand(str, 73, 3, 168, 1, 2);
						SendDataString("CODE128");
						SendDataByte(new byte[]{0x1b, 0x61, 0x00 });
						SendDataByte(code);
					}
				}
				else if(which == 9)
				{
					if(str.length() == 0)
					{
						Toast.makeText(PrintDemo.this, getText(R.string.empty1), Toast.LENGTH_SHORT).show();
						return;
					}
					else
					{
						byte[] code = PrinterCommand.getBarCommand(str, 1, 3, 8);
						SendDataString("QR Code");
						SendDataByte(new byte[]{0x1b, 0x61, 0x00 });
						SendDataByte(code);
					}
				}
			}
		}).create().show();	
	}

	/**
	 * print test page
	 * @param
	 */
	private void BluetoothPrintTest() {
		String msg = "";
		msg = "Division I is a research and development, production and services in one high-tech research and development, production-oriented enterprises, specializing in POS terminals finance, retail, restaurants, bars, songs and other areas, computer terminals, self-service terminal peripheral equipment R & D, manufacturing and sales! \n company's organizational structure concise and practical, pragmatic style of rigorous, efficient operation. Integrity, dedication, unity, and efficient is the company's corporate philosophy, and constantly strive for today, vibrant, the company will be strong scientific and technological strength, eternal spirit of entrepreneurship, the pioneering and innovative attitude, confidence towards the international information industry, with friends to create brilliant information industry !!! \n\n\n";
		SendDataString(msg);

	}
	
/****************************************************************************************************/
	private void SendDataByte(byte[] data){
		if(data.length>0)
		usbCtrl.sendByte(data, dev);
	}
	
	private void SendDataString(String data){
		if(data.length()>0)
		usbCtrl.sendMsg(data, "GBK", dev);
	}
	
	//
	private void SendDataBig5(String data) {
		
		if (data.length() > 0) {	
			usbCtrl.sendMsg(data, "BIG5", dev);
		}
	}
	
	private void SendDataThai(String data) {
		
		if (data.length() > 0) {
			usbCtrl.sendMsg(data, "CP874", dev);
		}
	}
	
	private void SendDataKor(String data) {
		
		if (data.length() > 0) {	
			usbCtrl.sendMsg(data, "EUC-KR", dev);
		}
	}
/****************************************************************************************************/
	 /**
	 * Load assets file resources
	 */
	private Bitmap getImageFromAssetsFile(String fileName) {
			Bitmap image = null;
			AssetManager am = getResources().getAssets();
			try {
				InputStream is = am.open(fileName);
				image = BitmapFactory.decodeStream(is);
				is.close();
			} catch (IOException e) {
				e.printStackTrace();
			}

			return image;

		}

}
