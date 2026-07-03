package com.pos.command.sdk;

public class Command {

	//Print Init
	public static byte[] ESC_Init = new byte[] {0x1b, 0x40 };
	

	//Print and wrap
	public static byte[] LF = new byte[] {0x0a};
	
	//Print and Paper
	public static byte[] ESC_J = new byte[] {0x1b, 0x4a, 0x00 };
	public static byte[] ESC_d = new byte[] {0x1b, 0x64, 0x00 };
	
	//Print SelfTest
	public static byte[] US_vt_eot = new byte[] {0x1f, 0x11, 0x04 };
	
	 //Beep command
    public static byte[] ESC_B_m_n = new byte[] {0x1b, 0x42, 0x00, 0x00 };
	
    //Cutter command
    public static byte[] GS_V_n = new byte[] {0x1d, 0x56, 0x00 };
    public static byte[] GS_V_m_n = new byte[] {0x1d, 0x56, 0x42, 0x00 };
    public static byte[] GS_i = new byte[] {0x1b, 0x69 };
    public static byte[] GS_m = new byte[] {0x1b, 0x6d };
	

	//Set character right spacing
	public static byte[] ESC_SP = new byte[] {0x1b, 0x20, 0x00 };
	
	//Format Character Printing Font
	public static byte[] ESC_ExclamationMark = new byte[] {0x1b, 0x21, 0x00 };
	
	//Set font height and width
	public static byte[] GS_ExclamationMark = new byte[] {0x1d, 0x21, 0x00 };
	
	//Set up reverse printing
	public static byte[] GS_B = new byte[] {0x1d, 0x42, 0x00 };
	
	//Cancel/select 90 degree rotation printing
	public static byte[] ESC_V = new byte[] {0x1b, 0x56, 0x00 };
	
	//Choose the font type (mainly ASCII code)
	public static byte[] ESC_M = new byte[] {0x1b, 0x4d, 0x00 };
	
	//Select/Cancel Bold Instruction
	public static byte[] ESC_G = new byte[] {0x1b, 0x47, 0x00 };
	public static byte[] ESC_E = new byte[] {0x1b, 0x45, 0x00 };
	
	//Select/Cancel Inverted Printing Mode
	public static byte[] ESC_LeftBrace = new byte[] {0x1b, 0x7b, 0x00 };
	
	//Set the height of the underline point (in characters))
	public static byte[] ESC_Minus = new byte[] {0x1b, 0x2d, 0x00 };
	
	//character pattern
	public static byte[] FS_dot = new byte[] {0x1c, 0x2e };
	
	//chinese mode
	public static byte[] FS_and = new byte[] {0x1c, 0x26 };
	
	//Set Chinese character printing mode
	public static byte[] FS_ExclamationMark = new byte[] {0x1c, 0x21, 0x00 };
	
	//Set the height of the underline point (in Chinese characters)
	public static byte[] FS_Minus = new byte[] {0x1c, 0x2d, 0x00 };
	
	//Set the left and right spacing of Chinese characters
	public static byte[] FS_S = new byte[] {0x1c, 0x53, 0x00, 0x00 };
	
	//Select Character Code Page
	public static byte[] ESC_t = new byte[] {0x1b, 0x74, 0x00 };
	

	//Set default row spacing
	public static byte[] ESC_Two = new byte[] {0x1b, 0x32}; 
	
	//Set Row Spacing
	public static byte[] ESC_Three = new byte[] {0x1b, 0x33, 0x00 };
	
	//Set alignment mode
	public static byte[] ESC_Align = new byte[] {0x1b, 0x61, 0x00 };
	
	//Set Left Margin
	public static byte[] GS_LeftSp = new byte[] {0x1d, 0x4c, 0x00 , 0x00 };
	
	//Set absolute printing position

	public static byte[] ESC_Relative = new byte[] {0x1b, 0x24, 0x00, 0x00 };
	
	//Set relative printing position
	public static byte[] ESC_Absolute = new byte[] {0x1b, 0x5c, 0x00, 0x00 };
	
	//Set the width of the printing area
	public static byte[] GS_W = new byte[] {0x1d, 0x57, 0x00, 0x00 };



	public static byte[] DLE_eot = new byte[] {0x10, 0x04, 0x00 };
	

	public static byte[] DLE_DC4 = new byte[] {0x10, 0x14, 0x00, 0x00, 0x00 };
	

	public static byte[] ESC_p = new byte[] {0x1b, 0x70, 0x00, 0x00, 0x00 };
	

	public static byte[] GS_H = new byte[] {0x1d, 0x48, 0x00 };
	
	//Set barcode height
	public static byte[] GS_h = new byte[] {0x1d, 0x68, (byte) 0xa2 };
	
	//Set barcode width
	public static byte[] GS_w = new byte[] {0x1d, 0x77, 0x00 };
	
	//Set HRI character font font font
	public static byte[] GS_f = new byte[] {0x1d, 0x66, 0x00 };
	
	//Barcode Left Offset Command
	public static byte[] GS_x = new byte[] {0x1d, 0x78, 0x00 };
	
	//Print barcode instructions
	public static byte[] GS_k = new byte[] {0x1d, 0x6b, 0x41, 0x0c };

	//QR code related instructions
    public static byte[] GS_k_m_v_r_nL_nH = new byte[] { 0x1b, 0x5a, 0x03, 0x03, 0x08, 0x00, 0x00 };
	
}
