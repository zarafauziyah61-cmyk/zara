let treeData = JSON.parse(localStorage.getItem("familyTree")) || {
  id: "root",
  name: "Zahra",
  image: "images/Aulia.jpg",
  children: [
    {
      id: "ayah",
      name: "Ayah: Hendra",
      image: "images/ayah.jpg",
      children: [
        {
          id: "kakekAyah",
          name: "Kakek (Ayah): Adang",
          image: "images/kakek.jpg",
          children: [
            {
              id: "buyutAyah",
              name: "Buyut (Ayah): Andjasmoeroe",
              image: "images/buyut.jpg",
              children: []
            }
          ]
        },
        {
          id: "nenekAyah",
          name: "Nenek (Ayah): Ilem",
          image: "images/nenek.jpg",
          children: []
        }
      ]
    },
    {
      id: "ibu",
      name: "Ibu: Ani",
      image: "images/ibu.jpg",
      children: [
        {
          id: "kakekIbu",
          name: "Kakek (Ibu): Zaenal",
          image: "images/kakek.jpg",
          children: []
        },
        {
          id: "nenekIbu",
          name: "Nenek (Ibu): Yayah",
          image: "images/nenek.jpg",
          children: []
        }
      ]
    }
  ]
};

function saveTree() {
  localStorage.setItem("familyTree", JSON.stringify(treeData));
}

function showPage(id) {
  document.querySelectorAll("main section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));
  document.querySelector(`nav button[onclick="showPage('${id}')"]`).classList.add("active");
}

function renderTree(node, container) {
  container.innerHTML = "";
  const ul = document.createElement("ul");
  ul.className = "tree";
  container.appendChild(ul);

  function draw(n, parent, level) {
    const li = document.createElement("li");

    // gambar node
    const img = document.createElement("img");
    img.src = n.image || "images/no-profile.jpg";
    img.alt = n.name;
    img.className = "node-img";

    // teks nama
    const span = document.createElement("span");
    span.textContent = n.name;

    // tombol hapus
    const delBtn = document.createElement("button");
    delBtn.textContent = "Hapus";
    delBtn.onclick = () => {
      deleteNode(treeData, n.id);
      saveTree();
      renderTree(treeData, container);
    };

    li.appendChild(img);
    li.appendChild(span);
    li.appendChild(delBtn);

    if (level === 0) li.className = "root-node";
    else if (n.children.length) li.className = "parent-node";
    else li.className = "leaf-node";

    parent.appendChild(li);

    if (n.children.length) {
      const childUl = document.createElement("ul");
      childUl.className = "tree";
      li.appendChild(childUl);
      n.children.forEach(c => draw(c, childUl, level + 1));
    }
  }

  draw(node, ul, 0);
  document.getElementById("info").textContent =
    `Total Node: ${countNodes(node)} | Kedalaman: ${getDepth(node)}`;
}

function deleteNode(node, id) {
  node.children = node.children.filter(c => c.id !== id);
  node.children.forEach(c => deleteNode(c, id));
}

function findNode(node, name) {
  if (node.name === name) return node;
  for (let c of node.children) {
    const found = findNode(c, name);
    if (found) return found;
  }
  return null;
}

// ✅ fungsi cek duplikat
function isDuplicateName(node, newName) {
  if (node.name === newName) return true;
  return node.children.some(c => isDuplicateName(c, newName));
}

document.addEventListener("DOMContentLoaded", () => {
  const treeDiv = document.getElementById("tree");
  renderTree(treeData, treeDiv);

  document.getElementById("familyForm").addEventListener("submit", e => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const role = document.getElementById("role").value.trim();
    const parent = document.getElementById("parent").value.trim();
    const file = document.getElementById("image").files[0];

    if (!file) return alert("Wajib upload gambar!");
    if (file.type !== "image/jpeg") return alert("Harus file JPG!");
    if (file.size > 100 * 1024) return alert("Ukuran maksimal 100KB!");

    const reader = new FileReader();
    reader.onload = function(evt) {
      const fullName = `${role}: ${name}`;

      // ✅ cek duplikat sebelum tambah
      if (isDuplicateName(treeData, fullName)) {
        return alert("Nama sudah ada di pohon, tidak boleh duplikat!");
      }

      const node = {
        id: Date.now().toString(),
        name: fullName,
        image: evt.target.result, // simpan base64
        children: []
      };

      if (parent) {
        const p = findNode(treeData, parent);
        if (!p) return alert("Parent tidak ditemukan");
        p.children.push(node);
      } else {
        treeData.children.push(node);
      }

      saveTree();
      renderTree(treeData, treeDiv);
      e.target.reset();
    };
    reader.readAsDataURL(file);
  });
});

function countNodes(node) {
  return 1 + node.children.reduce((a, c) => a + countNodes(c), 0);
}

function getDepth(node) {
  if (!node.children.length) return 1;
  return 1 + Math.max(...node.children.map(getDepth));
}

function resetTree() {
  localStorage.removeItem("familyTree"); // hapus data tersimpan
  location.reload(); // reload halaman agar tree kembali ke default
}