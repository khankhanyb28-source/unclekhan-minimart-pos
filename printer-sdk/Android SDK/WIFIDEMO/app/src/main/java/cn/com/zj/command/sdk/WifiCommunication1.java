package cn.com.zj.command.sdk;

import android.os.Handler;
import android.os.Message;
import android.util.Log;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.InetAddress;
import java.net.Socket;

public class WifiCommunication1 {
    private static Socket client = null;
    private static OutputStream out = null;
    private static InputStream inStream = null;
    private final Handler mHandler;
    private String AddressIp = null;
    private int port = 0;
    private WifiCommunication1.ConnectThread mConnection = null;
    public static final int WFPRINTER_CONNECTED = 0;
    public static final int WFPRINTER_DISCONNECTED = 1;
    public static final int WFPRINTER_CONNECTEDERR = 2;
    public static final int SEND_FAILED = 4;
    public static final int WFPRINTER_REVMSG = 5;

    public WifiCommunication1(Handler handler) {
        this.mHandler = handler;
    }

    public void initSocket(String AddressIp, int port) {
        this.AddressIp = AddressIp;
        this.port = port;
        if (this.mConnection != null) {
            this.mConnection = null;
        }

        if (this.mConnection == null) {
            this.mConnection = new WifiCommunication1.ConnectThread((WifiCommunication1.ConnectThread)null);
            //this.mConnection = new WifiCommunication1.ConnectThread((WifiCommunication1.ConnectThread)null);
            this.mConnection.start();
        }

    }

    public void sendMsg(String sndMsg, String charset) {

        Log.e("sendMsg","sendMsg");
        if (sndMsg != null) {
            try {
                byte[] send;
                try {
                    send = sndMsg.getBytes(charset);
                } catch (UnsupportedEncodingException var5) {
                    send = sndMsg.getBytes();
                }

                if (client!=null && client.isConnected() && !client.isOutputShutdown()) {
                    out.write(send);
                    Message msg = this.mHandler.obtainMessage(999);
                    this.mHandler.sendMessage(msg);
                    out.flush();
                }
            } catch (IOException var6) {
                Message msg = this.mHandler.obtainMessage(4);
                this.mHandler.sendMessage(msg);
                Log.d("WIFI-printer", var6.toString());
            }

        }
    }

    public void sndByte(byte[] send) {
        Log.e("sndByte","sndByte");
        if (send != null) {
            try {
                Log.e("sndByte",new String(send,"GBK"));
                if (client!=null && client.isConnected() && !client.isOutputShutdown()) {
                    out.write(send);
                    //out.write(send,0,send.length);

                    out.flush();
                    //if(new String(send,"GBK").contains("PRINT")){
                        Message msg_ret = this.mHandler.obtainMessage(50);
                        this.mHandler.sendMessage(msg_ret);
                    //}


                }else{
                    Log.e("WIFI-printer", "client is null");
                }
            } catch (IOException var4) {
                Log.d("WIFI-printer", var4.toString());
                Message msg_ret = this.mHandler.obtainMessage(4);
                this.mHandler.sendMessage(msg_ret);
            }

        }
    }

    public void close() {
        try {
            if (out != null) {
                out.close();
            }

            if (inStream != null) {
                inStream.close();
            }

            if (client != null) {
                client.close();
                out = null;
                inStream = null;
                client = null;
                Message msg_ret = this.mHandler.obtainMessage(1);
                this.mHandler.sendMessage(msg_ret);
            }
        } catch (IOException var2) {
            Log.d("WIFI-printer", var2.toString());
        }

    }

    public byte[] revMsg() {
        try {
            byte[] revData = new byte[1024];
            inStream.read(revData);
            return revData;
        } catch (Exception var2) {
            Log.d("WIFI-printer", var2.toString());
            return null;
        }
    }

    public int revByte() {
        try {
            return inStream.read();
        } catch (Exception var2) {
            Log.d("WIFI-printer", var2.toString());
            return -1;
        }
    }

    public String bytesToString(byte[] b) {
        String str = null;

        try {
            str = (new String(b, "UTF-8")).trim();
        } catch (UnsupportedEncodingException var4) {
            var4.printStackTrace();
        }

        return str;
    }

    private class ConnectThread extends Thread {
        private ConnectThread(ConnectThread connectThread) {
        }

        public void run() {
            Message msg_ret;
            try {
                InetAddress serverAddr = InetAddress.getByName(WifiCommunication1.this.AddressIp);
                WifiCommunication1.client = new Socket(serverAddr, WifiCommunication1.this.port);


                if (WifiCommunication1.client != null) {
                    WifiCommunication1.out = WifiCommunication1.client.getOutputStream();
                    WifiCommunication1.inStream = WifiCommunication1.client.getInputStream();
                }

                if (WifiCommunication1.client != null && WifiCommunication1.out != null && WifiCommunication1.inStream != null) {
                    msg_ret = WifiCommunication1.this.mHandler.obtainMessage(0);
                    WifiCommunication1.this.mHandler.sendMessage(msg_ret);
                }else{
                    //System.err.print(WifiCommunication1.client==null);
                }

            } catch (IOException var3) {
                msg_ret = WifiCommunication1.this.mHandler.obtainMessage(2);
                WifiCommunication1.this.mHandler.sendMessage(msg_ret);
            }
        }
    }
}
