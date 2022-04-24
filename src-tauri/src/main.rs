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
  SystemTrayEvent,
  Menu,
  MenuItem
};

fn main() {
  let _guard = sentry::init(("https://9b44882a84be4a2ab62475d9a675a034@o284609.ingest.sentry.io/6356710", sentry::ClientOptions {
    release: sentry::release_name!(),
    ..Default::default()
  }));

  // This should fix the cmd+c+v etc, but doesn't seem to be working
  let menu = Menu::new().add_native_item(MenuItem::Copy);
  let tray = SystemTray::new();

  tauri::Builder::default()
    .menu(menu)
    .system_tray(tray)
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
                // TODO: 323 = random number (due to retina?). May change between devices?
                x: (position.x as i32 - (size.width as i32 / 2)) - 323,
                y: 0
              }
            )
          ).unwrap();
        }
      }
      _ => {}
    })
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
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
