package cn.com.zj.command.sdk;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class Util {

    private static String CompressLZ77(String text)
    {
        //将转成16进制的文本进行压缩
        String result = null;
        char[] arrChar = text.toCharArray();
        int count = 1;
        for (int i = 1; i < text.length(); i++)
        {
            if (arrChar[i - 1] == arrChar[i])
            {
                count++;
            }
            else
            {
                result += convertNumber(count) + arrChar[i - 1];
                count = 1;
            }
            if (i == text.length() - 1)
            {
                result += convertNumber(count) + arrChar[i];
            }
        }
        return result;
    }

    /// <summary>
    /// ZPL压缩字典
    /// </summary>
    private static List<HashMap<Character, Integer>> compressDictionary = new ArrayList<>();

    private static String convertNumber(int count)
    {
        //将连续的数字转换成LZ77压缩代码，如000可用I0表示。
        String result = null;
        if (count > 1)
        {
            while (count > 0)
            {
                for (int i = compressDictionary.size() - 1; i >= 0; i--)
                {

                    HashMap<Character,Integer> aa= compressDictionary.get(i);
                    Set<Map.Entry<Character, Integer>> keyset =  aa.entrySet();
                    for (Map.Entry<Character, Integer> entry : keyset) {
                        Character key = entry.getKey();
                        int value = entry.getValue();

                        if (count >= value)
                        {
                            result += key;
                            count -= value;
                            break;
                        }
                        System.out.println(key+"--->"+value);
                    }

//                    if (count >= compressDictionary.get(i).
//                    {
//                        result += compressDictionary.get(i).;
//                        count -= compressDictionary[i].Value;
//                        break;
//                    }
                }
            }
        }
        return result;
    }
}
