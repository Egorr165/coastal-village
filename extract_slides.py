import zipfile
import re

def main():
    path = r"c:\Users\kalmy\OneDrive\Рабочий стол\ContinentSeven\Диплом.pptx"
    with zipfile.ZipFile(path, 'r') as z:
        # 1. Read presentation.xml to get slide drawing order
        pres_xml = z.read('ppt/presentation.xml').decode('utf-8', errors='ignore')
        # <p:sldId id="256" r:id="rId2"/>
        slide_id_list = re.findall(r'<p:sldId.*?r:id="(rId\d+)"', pres_xml)
        
        # 2. Read presentation.xml.rels to map rId to target slide
        rels_xml = z.read('ppt/_rels/presentation.xml.rels').decode('utf-8', errors='ignore')
        # <Relationship Id="rId2" Type="..." Target="slides/slide1.xml"/>
        rels = re.findall(r'<Relationship Id="(rId\d+)".*?Target="(slides/slide\d+\.xml)"', rels_xml)
        rel_map = {rid: target for rid, target in rels}
        
        # 3. Print out text for each slide in order
        for idx, rid in enumerate(slide_id_list, 1):
            if rid in rel_map:
                target = 'ppt/' + rel_map[rid]
                try:
                    content = z.read(target).decode('utf-8', errors='ignore')
                    texts = re.findall(r'<a:t>(.*?)</a:t>', content)
                    print(f"--- SLIDE {idx} ---")
                    # filter out empty strings and strip
                    texts = [t.strip() for t in texts if t.strip()]
                    print("\n".join(texts))
                except BaseException as e:
                    print(f"Error reading slide {idx} ({target}): {e}")

if __name__ == '__main__':
    main()
