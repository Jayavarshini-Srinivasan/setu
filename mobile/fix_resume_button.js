const fs = require("fs");
const path = require("path");

const p = path.join(__dirname, "screens", "professional", "ResumePreviewScreen.js");
if (fs.existsSync(p)) {
  let content = fs.readFileSync(p, "utf8");
  content = content.replace(/<TouchableOpacity style=\{styles.approveBtn\} onPress=\{handleApprove\} disabled=\{approving\}>[\s\S]*?<\/TouchableOpacity>/, `<TouchableOpacity style={styles.approveBtn} onPress={handleDownloadPDF} disabled={approving}>
          <Text style={styles.approveBtnText}>Download Resume</Text>
        </TouchableOpacity>`);
  content = content.replace(/<TouchableOpacity style=\{styles.downloadIconBtn\} onPress=\{handleDownloadPDF\} activeOpacity=\{0.85\}>[\s\S]*?<\/TouchableOpacity>/, "");
  fs.writeFileSync(p, content, "utf8");
}

