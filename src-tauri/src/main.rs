#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::{
  Manager,
  Position,
  PhysicalPosition,
  TrayIcon,
  SystemTray,
  SystemTrayEvent
};

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let window = app.get_window("main").unwrap();
      let tray = app.tray_handle();

      window.listen("recording", move |event| {
        if event.payload() == Some("true") {
          tray.set_icon(
            TrayIcon::Raw(include_bytes!("../icons/tray-recording@2x.png").to_vec())
          ).unwrap();
        } else {
          tray.set_icon(
            TrayIcon::Raw(include_bytes!("../icons/tray@2x.png").to_vec())
          ).unwrap();
        }
      });

      Ok(())
    })
    .system_tray(SystemTray::new())
    .on_system_tray_event(|app, event| match event {
      SystemTrayEvent::LeftClick {
        position,
        size,
        ..
      } => {
        let window = app.get_window("main").unwrap();

        if window.is_visible().unwrap() {
          window.hide().unwrap();
        } else {
          window.show().unwrap();
          window.set_focus().unwrap();
          window.set_position(
            Position::Physical(
              PhysicalPosition {
                // NOTE: 323 = random number (due to retina?). May change between devices?
                x: (position.x as i32 - (size.width as i32 / 2)) - 323,
                y: position.y as i32
              }
            )
          ).unwrap();
        }
      }
      _ => {}
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
